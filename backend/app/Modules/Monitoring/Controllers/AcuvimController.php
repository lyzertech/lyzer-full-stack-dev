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
     * Return unique device/gateway combinations discovered in monitoring_acuvim,
     * excluding any device_name that is already registered in monitoring_devices.
     * Used by the "Scan Network" feature on the Devices page.
     */
    public function scan()
    {
        // Collect all device names already registered in monitoring_devices
        $registeredNames = DB::table('monitoring_devices')
            ->whereNull('deleted_at')
            ->pluck('name');

        $results = DB::table('monitoring_acuvim')
            ->select([
                'gateway_name',
                'gateway_serial',
                'device_name',
                'device_model',
                'device_serial',
            ])
            ->whereNotNull('device_serial')
            ->whereNotIn('device_name', $registeredNames)
            ->groupBy([
                'gateway_name',
                'gateway_serial',
                'device_name',
                'device_model',
                'device_serial',
            ])
            ->orderBy('gateway_name')
            ->orderBy('device_name')
            ->get();

        return response()->json($results);
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
     * Return daily energy consumption (EP_IMP_kWh increment) for all devices in a facility.
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

        $devices = DB::table('monitoring_devices')
            ->where('facility_id', $request->facility_id)
            ->whereNull('deleted_at')
            ->pluck('name');

        if ($devices->isEmpty()) {
            return response()->json([]);
        }

        $data = DB::table('monitoring_acuvim')
            ->selectRaw('DATE(Timestamp) as date, device_name, (MAX(EP_IMP_kWh) - MIN(EP_IMP_kWh)) as increment')
            ->whereIn('device_name', $devices)
            ->whereDate('Timestamp', '>=', $request->date_from)
            ->whereDate('Timestamp', '<=', $request->date_to)
            ->groupByRaw('DATE(Timestamp), device_name')
            ->get();

        $result = [];
        foreach ($data as $row) {
            if (!isset($result[$row->date])) {
                $result[$row->date] = 0;
            }
            $result[$row->date] += (float)$row->increment;
        }

        $formatted = [];
        foreach ($result as $date => $val) {
            $formatted[] = ['date' => $date, 'value' => round($val, 2)];
        }

        usort($formatted, function($a, $b) {
            return strcmp($a['date'], $b['date']);
        });

        return response()->json($formatted);
    }
}
