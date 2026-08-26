<?php

namespace App\Modules\Monitoring\Controllers;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcuvimController extends Controller
{
    private const ALLOWED_INTERVALS = [5, 10, 15, 30, 60];

    /** Columns required by the analysis dashboard charts (not full telemetry row). */
    private const ANALYSIS_COLUMNS = [
        'Timestamp',
        'V1', 'V2', 'V3', 'V12', 'V23', 'V31', 'Vnavg_V', 'Vlavg_V',
        'I1', 'I2', 'I3', 'Iavg_A', 'In',
        'Freq_Hz',
        'Psum_kW', 'Qsum_kvar', 'Ssum_kVA',
        'PF1', 'PF2', 'PF3', 'PF',
        'EP_IMP_kWh', 'EP_EXP_kWh', 'EQ_IMP_kvarh', 'EQ_EXP_kvarh', 'ES_kVAh',
        'Ang_Vb', 'Ang_Vc', 'Ang_Ia', 'Ang_Ib', 'Ang_Ic',
    ];

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
     * Normalizes timestamps to bucket slot times (e.g., 23:25 → 23:00 for 1h interval).
     * Excludes readings that round to the next day (e.g., 23:55 → 00:00) BEFORE bucketing.
     *
     * @param  \Illuminate\Support\Collection<int, object>  $rows
     * @return array<int, object>
     */
    private function bucketRows($rows, int $intervalMin): array
    {
        $buckets = [];
        foreach ($rows as $row) {
            $key = $this->slotKey((string) $row->Timestamp, $intervalMin);
            $dt = \Carbon\Carbon::parse($row->Timestamp);
            [$hours, $minutes] = explode(':', $key);
            
            $slotHour = (int)$hours;
            $originalHour = $dt->hour;
            
            // Exclude wraparound BEFORE adding to bucket
            // Late evening readings (22:xx-23:xx) rounding to early morning (00:xx-02:xx)
            // belong to the NEXT day, so skip them
            if ($slotHour <= 2 && $originalHour >= 22) {
                continue; // Skip this reading entirely
            }
            
            if (! isset($buckets[$key]) || $row->Timestamp > $buckets[$key]->Timestamp) {
                $buckets[$key] = $row;
            }
        }

        // Normalize timestamps to bucket slot times
        foreach ($buckets as $slotKey => $row) {
            $dt = \Carbon\Carbon::parse($row->Timestamp);
            [$hours, $minutes] = explode(':', $slotKey);
            $normalizedDt = $dt->copy()->setTime((int)$hours, (int)$minutes, 0);
            $row->Timestamp = $normalizedDt->format('Y-m-d H:i:s');
        }

        $values = array_values($buckets);
        // Sort ascending (chronological order: 00:00, 01:00, 02:00, ...)
        usort($values, fn ($a, $b) => strcmp((string) $a->Timestamp, (string) $b->Timestamp));

        return $values;
    }

    private function dayStart(string $date): string
    {
        return $date . ' 00:00:00';
    }

    private function dayEnd(string $date): string
    {
        return $date . ' 23:59:59';
    }

    /**
     * Fetch one row per time bucket directly in SQL instead of loading the full day.
     *
     * @return array<int, object>
     */
    private function fetchBucketedRows(
        string $deviceName,
        ?string $deviceSerial,
        ?string $dateFrom,
        ?string $dateTo,
        int $intervalMin,
    ): array {
        $bucketExpr = 'ROUND((EXTRACT(HOUR FROM `Timestamp`) * 60 + EXTRACT(MINUTE FROM `Timestamp`)) / ?) * ?';

        $bucketQuery = DB::table('monitoring_acuvim')
            ->selectRaw('MAX(`Timestamp`) as max_ts')
            ->where('device_name', $deviceName);

        if ($deviceSerial) {
            $bucketQuery->where('device_serial', $deviceSerial);
        }

        if ($dateFrom) {
            $bucketQuery->where('Timestamp', '>=', $this->dayStart($dateFrom));
        }

        if ($dateTo) {
            $bucketQuery->where('Timestamp', '<=', $this->dayEnd($dateTo));
        }

        $bucketQuery->groupByRaw($bucketExpr, [$intervalMin, $intervalMin]);

        $selectColumns = array_map(fn (string $col) => "a.{$col}", self::ANALYSIS_COLUMNS);

        $rows = DB::table('monitoring_acuvim as a')
            ->joinSub($bucketQuery, 'b', function ($join) {
                $join->on('a.Timestamp', '=', 'b.max_ts');
            })
            ->where('a.device_name', $deviceName)
            ->when($deviceSerial, fn ($q) => $q->where('a.device_serial', $deviceSerial))
            ->when($dateFrom, fn ($q) => $q->where('a.Timestamp', '>=', $this->dayStart($dateFrom)))
            ->when($dateTo, fn ($q) => $q->where('a.Timestamp', '<=', $this->dayEnd($dateTo)))
            ->orderByDesc('a.Timestamp')
            ->get($selectColumns);

        return $this->bucketRows($rows, $intervalMin);
    }

    /**
     * @param  array<int, object>  $rows
     */
    private function lastBucketOfDay(array $rows): ?object
    {
        if ($rows === []) {
            return null;
        }

        usort($rows, fn ($a, $b) => strcmp((string) $a->Timestamp, (string) $b->Timestamp));

        return $rows[array_key_last($rows)];
    }

    /**
     * Find the baseline reading from the previous day that aligns with the interval.
     * For proper energy delta calculation, we need the reading at the last interval slot
     * before midnight (e.g., 23:00 for 1h, 23:30 for 30m, 23:55 for 5m).
     *
     * @param  array<int, object>  $rows  Bucketed rows from previous day
     * @param  int  $intervalMin  Interval in minutes (5, 10, 15, 30, 60)
     * @return object|null
     */
    private function lastIntervalBaseline(array $rows, int $intervalMin): ?object
    {
        if ($rows === []) {
            return null;
        }

        // Calculate the last interval slot before midnight in minutes
        // Examples: 5min→1435 (23:55), 15min→1425 (23:45), 30min→1410 (23:30), 60min→1380 (23:00)
        $targetMinutes = 1440 - $intervalMin;

        // Find the reading closest to this target time
        // Prefer readings AT or BEFORE the target over those after
        $bestMatch = null;
        $bestDiff = PHP_INT_MAX;

        foreach ($rows as $row) {
            $dt = \Carbon\Carbon::parse($row->Timestamp);
            $rowMinutes = $dt->hour * 60 + $dt->minute;

            // Skip readings that would round to the next day (e.g., 23:58 with 5-min → 00:00)
            if ($rowMinutes > $targetMinutes + ($intervalMin / 2)) {
                continue;
            }

            // Calculate absolute difference
            $diff = abs($rowMinutes - $targetMinutes);

            // If this is closer to target, or same distance but earlier, use it
            if ($diff < $bestDiff || ($diff === $bestDiff && $rowMinutes <= $targetMinutes)) {
                $bestDiff = $diff;
                $bestMatch = $row;
            }
        }

        return $bestMatch ?? $this->lastBucketOfDay($rows);
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
     *   &device_serial=F-019   (optional — scopes to monitoring_devices.device_code)
     *   &date_from=2025-01-01
     *   &date_to=2025-01-31
     *   &per_page=25        (default 50, max 500)
     *   &page=1
     *   &interval_min=5     (optional — bucket on server; 5|10|15|30|60)
     */
    public function data(Request $request)
    {
        $request->validate([
            'device_name'   => 'required|string|max:255',
            'device_serial' => 'nullable|string|max:100',
            'date_from'     => 'nullable|date',
            'date_to'       => 'nullable|date|after_or_equal:date_from',
            'per_page'      => 'nullable|integer|min:1|max:500',
            'interval_min'  => 'nullable|integer|in:5,10,15,30,60',
        ]);

        $deviceName = $request->device_name;
        $deviceSerial = $request->filled('device_serial') ? $request->device_serial : null;
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;

        if ($request->filled('interval_min')) {
            $intervalMin = $this->normalizeInterval((int) $request->interval_min);
            $bucketed = $this->fetchBucketedRows(
                $deviceName,
                $deviceSerial,
                $dateFrom,
                $dateTo,
                $intervalMin,
            );
            $count = count($bucketed);

            return response()->json([
                'data'         => $bucketed,
                'interval_min' => $intervalMin,
                'meta'         => [
                    'bucket_count' => $count,
                ],
                'current_page' => 1,
                'last_page'    => 1,
                'per_page'     => $count,
                'total'        => $count,
            ]);
        }

        $query = DB::table('monitoring_acuvim')
            ->where('device_name', $deviceName)
            ->orderByDesc('Timestamp');

        if ($deviceSerial) {
            $query->where('device_serial', $deviceSerial);
        }

        if ($dateFrom) {
            $query->where('Timestamp', '>=', $this->dayStart($dateFrom));
        }

        if ($dateTo) {
            $query->where('Timestamp', '<=', $this->dayEnd($dateTo));
        }

        $perPage = min((int) ($request->per_page ?? 50), 500);
        $result = $query->paginate($perPage);

        return response()->json($result);
    }

    /**
     * Analysis dashboard: bucketed rows for one day plus previous-day baseline in one call.
     *
     * GET /api/v1/monitoring/acuvim/analysis-day
     *   ?device_name=METER_01
     *   &device_serial=F-019   (optional)
     *   &date=2025-01-15
     *   &interval_min=5
     */
    public function analysisDay(Request $request)
    {
        $request->validate([
            'device_name'   => 'required|string|max:255',
            'device_serial' => 'nullable|string|max:100',
            'date'          => 'required|date',
            'interval_min'  => 'nullable|integer|in:5,10,15,30,60',
        ]);

        $deviceName = $request->device_name;
        $deviceSerial = $request->filled('device_serial') ? $request->device_serial : null;
        $date = $request->date;
        $intervalMin = $this->normalizeInterval((int) ($request->interval_min ?? 5));
        $previousDate = Carbon::parse($date)->subDay()->toDateString();

        $todayRows = $this->fetchBucketedRows(
            $deviceName,
            $deviceSerial,
            $date,
            $date,
            $intervalMin,
        );

        $previousRows = $this->fetchBucketedRows(
            $deviceName,
            $deviceSerial,
            $previousDate,
            $previousDate,
            $intervalMin,
        );

        return response()->json([
            'data' => $todayRows,
            'previous_baseline' => $this->lastIntervalBaseline($previousRows, $intervalMin),
            'interval_min' => $intervalMin,
            'date' => $date,
            'previous_date' => $previousDate,
            'meta' => [
                'bucket_count' => count($todayRows),
            ],
        ]);
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
            ->where('a.Timestamp', '>=', $this->dayStart($request->date_from))
            ->where('a.Timestamp', '<=', $this->dayEnd($request->date_to))
            ->selectRaw(
                'DATE(`a`.`Timestamp`) as date,
                d.device_code,
                MAX(`a`.`EP_TOTAL_kWh`) as max_reading,
                MIN(`a`.`EP_TOTAL_kWh`) as min_reading,
                COUNT(*) as sample_count'
            )
            ->groupByRaw('DATE(`a`.`Timestamp`), d.device_code')
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
