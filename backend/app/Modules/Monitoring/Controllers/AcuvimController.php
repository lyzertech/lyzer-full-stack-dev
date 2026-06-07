<?php

namespace App\Modules\Monitoring\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcuvimController extends Controller
{
    private const ALLOWED_INTERVALS = [5, 10, 15, 30, 60];

    private function normalizeInterval(int $value): int
    {
        return in_array($value, self::ALLOWED_INTERVALS, true) ? $value : 5;
    }

    /** Map timestamp → HH:mm bucket (matches analysis dashboard). */
    private function slotKey(string $timestamp, int $intervalMin): string
    {
        $dt = \Carbon\Carbon::parse($timestamp);
        $totalMin = $dt->hour * 60 + $dt->minute;
        $rounded = (int) round($totalMin / $intervalMin) * $intervalMin;
        $hours = intdiv($rounded, 60) % 24;
        $minutes = $rounded % 60;

        return sprintf('%02d:%02d', $hours, $minutes);
    }

    /**
     * Keep the latest sample per interval bucket for one day.
     *
     * @param  \Illuminate\Support\Collection<int, object>  $rows
     * @return array<int, object>
     */
    private function bucketRows($rows, int $intervalMin): array
    {
        $buckets = [];
        foreach ($rows as $row) {
            $key = $this->slotKey((string) $row->Timestamp, $intervalMin);
            if (! isset($buckets[$key]) || $row->Timestamp > $buckets[$key]->Timestamp) {
                $buckets[$key] = $row;
            }
        }

        $values = array_values($buckets);
        usort($values, fn ($a, $b) => strcmp((string) $b->Timestamp, (string) $a->Timestamp));

        return $values;
    }

    /**
     * Return unique device/gateway combinations discovered in monitoring_acuvim.
     * Match key: monitoring_acuvim.device_serial ↔ monitoring_devices.device_code.
     * "available" = serial not yet registered; "registered_elsewhere" = serial already taken.
     */
    public function scan()
    {
        $registeredSerials = DB::table('monitoring_devices')
            ->whereNull('deleted_at')
            ->pluck('device_code');

        $discoveredQuery = DB::table('monitoring_acuvim')
            ->select([
                'gateway_name',
                'gateway_serial',
                'device_name',
                'device_model',
                'device_serial',
            ])
            ->whereNotNull('device_serial')
            ->where('device_serial', '!=', '')
            ->groupBy([
                'gateway_name',
                'gateway_serial',
                'device_name',
                'device_model',
                'device_serial',
            ])
            ->orderBy('device_serial');

        $available = (clone $discoveredQuery)
            ->whereNotIn('device_serial', $registeredSerials)
            ->get();

        $registeredElsewhere = DB::table('monitoring_acuvim as a')
            ->join('monitoring_devices as d', function ($join) {
                $join->on('d.device_code', '=', 'a.device_serial')
                    ->whereNull('d.deleted_at');
            })
            ->join('monitoring_facilities as f', 'f.id', '=', 'd.facility_id')
            ->join('monitoring_organizations as o', 'o.id', '=', 'f.organization_id')
            ->whereNotNull('a.device_serial')
            ->where('a.device_serial', '!=', '')
            ->groupBy([
                'a.gateway_name',
                'a.gateway_serial',
                'a.device_name',
                'a.device_model',
                'a.device_serial',
                'd.name',
                'f.name',
                'o.name',
                'o.id',
            ])
            ->orderBy('a.device_serial')
            ->get([
                'a.gateway_name',
                'a.gateway_serial',
                'a.device_name',
                'a.device_model',
                'a.device_serial',
                'd.name as registered_name',
                'f.name as facility_name',
                'o.name as organization_name',
                'o.id as organization_id',
            ]);

        return response()->json([
            'available' => $available,
            'registered_elsewhere' => $registeredElsewhere,
        ]);
    }

    /**
     * Return a list of distinct device names available in monitoring_acuvim.
     * Used to populate the device-name selector on the Data Retrieval page.
     *
     * GET /api/v1/monitoring/acuvim/devices
     */
    public function deviceNames()
    {
        $names = DB::table('monitoring_acuvim')
            ->select(['device_name', 'device_model', 'gateway_name'])
            ->whereNotNull('device_name')
            ->groupBy(['device_name', 'device_model', 'gateway_name'])
            ->orderBy('device_name')
            ->get();

        return response()->json($names);
    }

    /**
     * Return paginated monitoring_acuvim records filtered by device_name
     * and an optional date range.
     *
     * GET /api/v1/monitoring/acuvim/data
     *   ?device_name=METER_01
     *   &date_from=2025-01-01
     *   &date_to=2025-01-31
     *   &per_page=25        (default 50, max 500)
     *   &page=1
     *   &interval_min=5     (optional — bucket on server; 5|10|15|30|60)
     */
    public function data(Request $request)
    {
        $request->validate([
            'device_name'  => 'required|string|max:255',
            'date_from'    => 'nullable|date',
            'date_to'      => 'nullable|date|after_or_equal:date_from',
            'per_page'     => 'nullable|integer|min:1|max:500',
            'interval_min' => 'nullable|integer|in:5,10,15,30,60',
        ]);

        $query = DB::table('monitoring_acuvim')
            ->where('device_name', $request->device_name)
            ->orderByDesc('Timestamp');

        if ($request->filled('date_from')) {
            $query->whereDate('Timestamp', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('Timestamp', '<=', $request->date_to);
        }

        if ($request->filled('interval_min')) {
            $intervalMin = $this->normalizeInterval((int) $request->interval_min);
            $all = $query->get();
            $bucketed = $this->bucketRows($all, $intervalMin);
            $count = count($bucketed);

            return response()->json([
                'data'         => $bucketed,
                'interval_min' => $intervalMin,
                'meta'         => [
                    'raw_count'    => $all->count(),
                    'bucket_count' => $count,
                ],
                'current_page' => 1,
                'last_page'    => 1,
                'per_page'     => $count,
                'total'        => $count,
            ]);
        }

        $perPage = min((int) ($request->per_page ?? 50), 500);
        $result = $query->paginate($perPage);

        return response()->json($result);
    }

    /**
     * Return daily energy consumption derived from EP_TOTAL_kWh (cumulative register).
     *
     * Match key: monitoring_acuvim.device_serial ↔ monitoring_devices.device_code
     * (and device_name ↔ name) so telemetry from other facilities sharing the same
     * display name is excluded.
     *
     * EP_TOTAL_kWh is a running total on the meter — not daily usage. Per device/day:
     * - multiple samples: MAX − MIN within the day
     * - single sample: delta from the previous day's end reading
     *
     * GET /api/v1/monitoring/acuvim/daily-energy
     */
    public function dailyEnergy(Request $request)
    {
        $request->validate([
            'facility_id' => 'required|integer',
            'date_from'   => 'required|date',
            'date_to'     => 'required|date|after_or_equal:date_from',
        ]);

        $deviceCount = DB::table('monitoring_devices')
            ->where('facility_id', $request->facility_id)
            ->whereNull('deleted_at')
            ->whereNotNull('device_code')
            ->where('device_code', '!=', '')
            ->count();

        if ($deviceCount === 0) {
            return response()->json([]);
        }

        $rows = DB::table('monitoring_devices as d')
            ->join('monitoring_acuvim as a', function ($join) {
                $join->on('a.device_serial', '=', 'd.device_code')
                    ->on('a.device_name', '=', 'd.name');
            })
            ->where('d.facility_id', $request->facility_id)
            ->whereNull('d.deleted_at')
            ->whereNotNull('a.EP_TOTAL_kWh')
            ->whereNotNull('a.device_serial')
            ->where('a.device_serial', '!=', '')
            ->whereDate('a.Timestamp', '>=', $request->date_from)
            ->whereDate('a.Timestamp', '<=', $request->date_to)
            ->selectRaw(
                'DATE(a.Timestamp) as date,
                d.device_code,
                MAX(a.EP_TOTAL_kWh) as max_reading,
                MIN(a.EP_TOTAL_kWh) as min_reading,
                COUNT(*) as sample_count'
            )
            ->groupByRaw('DATE(a.Timestamp), d.device_code')
            ->orderBy('date')
            ->get();

        $byDevice = [];
        foreach ($rows as $row) {
            $byDevice[$row->device_code][] = $row;
        }

        $result = [];
        foreach ($byDevice as $deviceDays) {
            $prevMaxReading = null;

            foreach ($deviceDays as $row) {
                $maxReading = (float) $row->max_reading;
                $minReading = (float) $row->min_reading;
                $consumption = 0.0;

                if ((int) $row->sample_count > 1 && $maxReading > $minReading) {
                    $consumption = $maxReading - $minReading;
                } elseif ($prevMaxReading !== null && $maxReading >= $prevMaxReading) {
                    $consumption = $maxReading - $prevMaxReading;
                }

                $prevMaxReading = $maxReading;

                if (! isset($result[$row->date])) {
                    $result[$row->date] = 0;
                }
                $result[$row->date] += $consumption;
            }
        }

        $formatted = [];
        foreach ($result as $date => $val) {
            $formatted[] = ['date' => $date, 'value' => round($val, 2)];
        }

        usort($formatted, fn ($a, $b) => strcmp($a['date'], $b['date']));

        return response()->json($formatted);
    }
}
