<?php

namespace App\Modules\Monitoring\Services;

use App\Modules\Monitoring\Models\Device;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DeviceStatusResolver
{
    private const RECENT_MINUTES = 30;

    private const CHUNK_SIZE = 100;

    /**
     * @param  Collection<int, Device>|array<int, Device>  $devices
     */
    public function applyToCollection(Collection|array $devices): void
    {
        $devices = $devices instanceof Collection ? $devices : collect($devices);

        if ($devices->isEmpty()) {
            return;
        }

        $latestByKey = $this->buildLatestMap($devices);
        $threshold = now()->subMinutes(self::RECENT_MINUTES);

        foreach ($devices as $device) {
            $device->setAttribute('status', $this->resolveStatus($device, $latestByKey, $threshold));
        }
    }

    /**
     * @param  Collection<int, Device>  $devices
     * @return array<string, string>
     */
    public function buildLatestMap(Collection $devices): array
    {
        $pairs = $devices
            ->filter(fn (Device $device) => filled($device->name) && filled($device->device_code))
            ->unique(fn (Device $device) => $this->pairKey($device->name, $device->device_code))
            ->values();

        if ($pairs->isEmpty()) {
            return [];
        }

        $map = [];

        foreach ($pairs->chunk(self::CHUNK_SIZE) as $chunk) {
            $query = DB::table('monitoring_acuvim')
                ->selectRaw('device_name, device_serial, MAX(`Timestamp`) as latest_ts')
                ->whereNotNull('device_serial')
                ->where('device_serial', '!=', '')
                ->where(function ($builder) use ($chunk) {
                    foreach ($chunk as $device) {
                        $builder->orWhere(function ($nested) use ($device) {
                            $nested->where('device_name', $device->name)
                                ->where('device_serial', $device->device_code);
                        });
                    }
                })
                ->groupBy('device_name', 'device_serial');

            foreach ($query->get() as $row) {
                $map[$this->pairKey($row->device_name, $row->device_serial)] = (string) $row->latest_ts;
            }
        }

        return $map;
    }

    public function resolveStatus(Device $device, array $latestByKey, ?Carbon $threshold = null): string
    {
        $threshold ??= now()->subMinutes(self::RECENT_MINUTES);
        $latest = $latestByKey[$this->pairKey($device->name, $device->device_code)] ?? null;

        if ($latest !== null) {
            return Carbon::parse($latest)->gte($threshold) ? 'Online' : 'Offline';
        }

        return $device->getRawOriginal('status') ?? $device->status ?? 'Inactive';
    }

    /**
     * @param  Collection<int, Device>  $devices
     * @return array{
     *     total: int,
     *     online: int,
     *     offline: int,
     *     inactive: int,
     *     electricity: int
     * }
     */
    public function summarize(Collection $devices, array $latestByKey): array
    {
        $threshold = now()->subMinutes(self::RECENT_MINUTES);
        $online = 0;
        $offline = 0;
        $inactive = 0;
        $electricity = 0;

        foreach ($devices as $device) {
            $status = $this->resolveStatus($device, $latestByKey, $threshold);

            if ($status === 'Online') {
                $online++;
            } elseif ($status === 'Offline' || $status === 'Warning') {
                $offline++;
            } else {
                $inactive++;
            }

            $type = $device->device_type ?? '';
            if (in_array($type, ['Meter', 'Gateway', 'Sensor', 'Acuvim'], true) || $type === '') {
                $electricity++;
            }
        }

        return [
            'total' => $devices->count(),
            'online' => $online,
            'offline' => $offline,
            'inactive' => $inactive,
            'electricity' => $electricity,
        ];
    }

    private function pairKey(?string $name, ?string $serial): string
    {
        return ($name ?? '') . "\0" . ($serial ?? '');
    }
}
