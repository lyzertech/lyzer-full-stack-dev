<?php

namespace App\Modules\Vehicle\Services;

use App\Modules\Vehicle\Models\ServiceReminder;
use App\Modules\Vehicle\Models\ServiceSchedule;
use App\Modules\Vehicle\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReminderCalculationService
{
    /**
     * Recalculate and update reminders for a vehicle after a service event.
     */
    public function recalculateForVehicle(Vehicle $vehicle): void
    {
        $schedules = ServiceSchedule::where('vehicle_id', $vehicle->id)
            ->where('is_active', 1)
            ->get();

        foreach ($schedules as $schedule) {
            $this->recalculateSchedule($schedule, $vehicle);
        }

        // Also refresh document expiry reminders
        $this->refreshDocumentReminders($vehicle);
    }

    public function recalculateSchedule(ServiceSchedule $schedule, Vehicle $vehicle): void
    {
        $nextDueOdometer = null;
        $nextDueDate     = null;
        $nextDueHours    = null;

        if (in_array($schedule->trigger_type, ['mileage', 'mileage_and_time'])) {
            $base = $schedule->last_service_odometer ?? $vehicle->odometer;
            $nextDueOdometer = $base + $schedule->interval_km;
        }

        if (in_array($schedule->trigger_type, ['time', 'mileage_and_time'])) {
            $base = $schedule->last_service_date
                ? Carbon::parse($schedule->last_service_date)
                : Carbon::now();
            $nextDueDate = $base->addDays($schedule->interval_days);
        }

        if ($schedule->trigger_type === 'hours') {
            $base = $schedule->last_service_hours ?? 0;
            $nextDueHours = $base + $schedule->interval_hours;
        }

        $schedule->update([
            'next_due_odometer' => $nextDueOdometer,
            'next_due_date'     => $nextDueDate,
            'next_due_hours'    => $nextDueHours,
        ]);

        // Upsert the associated reminder
        $this->upsertReminder($schedule, $vehicle, $nextDueOdometer, $nextDueDate, $nextDueHours);
    }

    private function upsertReminder(
        ServiceSchedule $schedule,
        Vehicle $vehicle,
        ?float $nextDueOdometer,
        ?Carbon $nextDueDate,
        ?float $nextDueHours
    ): void {
        $status = $this->calculateStatus($vehicle, $nextDueOdometer, $nextDueDate, $nextDueHours);

        ServiceReminder::updateOrCreate(
            ['service_schedule_id' => $schedule->id],
            [
                'vehicle_id'       => $vehicle->id,
                'reminder_type'    => 'scheduled_maintenance',
                'title'            => $schedule->service_name,
                'description'      => $schedule->description,
                'due_odometer'     => $nextDueOdometer,
                'due_date'         => $nextDueDate,
                'due_hours'        => $nextDueHours,
                'status'           => $status,
            ]
        );
    }

    public function calculateStatus(
        Vehicle $vehicle,
        ?float $nextDueOdometer,
        ?Carbon $nextDueDate,
        ?float $nextDueHours
    ): string {
        $today = Carbon::today();
        $advanceDays = 7;
        $advanceKm   = 500;

        // Overdue checks
        if ($nextDueDate && $nextDueDate->lt($today)) return 'overdue';
        if ($nextDueOdometer && $vehicle->odometer >= $nextDueOdometer) return 'overdue';

        // Due today
        if ($nextDueDate && $nextDueDate->isToday()) return 'due_today';
        if ($nextDueOdometer && ($nextDueOdometer - $vehicle->odometer) <= 0) return 'due_today';

        // Upcoming
        if ($nextDueDate && $nextDueDate->lte($today->addDays($advanceDays))) return 'upcoming';
        if ($nextDueOdometer && ($nextDueOdometer - $vehicle->odometer) <= $advanceKm) return 'upcoming';

        return 'upcoming';
    }

    public function refreshDocumentReminders(Vehicle $vehicle): void
    {
        $today = Carbon::today();

        // Insurance expiry reminder
        if ($vehicle->insurance_expiry) {
            $expiry = Carbon::parse($vehicle->insurance_expiry);
            $status = $expiry->lt($today) ? 'overdue' : ($expiry->lte($today->copy()->addDays(30)) ? 'upcoming' : 'upcoming');

            ServiceReminder::updateOrCreate(
                ['vehicle_id' => $vehicle->id, 'reminder_type' => 'insurance_expiry'],
                [
                    'title'       => 'Insurance Expiry — ' . $vehicle->vehicle_code,
                    'description' => 'Vehicle insurance expires on ' . $expiry->format('d M Y'),
                    'due_date'    => $expiry,
                    'status'      => $status,
                ]
            );
        }

        // Registration expiry reminder
        if ($vehicle->registration_expiry) {
            $expiry = Carbon::parse($vehicle->registration_expiry);
            $status = $expiry->lt($today) ? 'overdue' : 'upcoming';

            ServiceReminder::updateOrCreate(
                ['vehicle_id' => $vehicle->id, 'reminder_type' => 'registration_expiry'],
                [
                    'title'       => 'Registration Expiry — ' . $vehicle->vehicle_code,
                    'description' => 'Vehicle registration expires on ' . $expiry->format('d M Y'),
                    'due_date'    => $expiry,
                    'status'      => $status,
                ]
            );
        }
    }

    /**
     * Bulk refresh statuses for all active reminders.
     */
    public function refreshAllStatuses(): int
    {
        $reminders = ServiceReminder::whereNotIn('status', ['completed', 'dismissed'])
            ->with('vehicle')
            ->get();

        $updated = 0;
        $today = Carbon::today();

        foreach ($reminders as $reminder) {
            if (!$reminder->vehicle) continue;

            $dueDate     = $reminder->due_date ? Carbon::parse($reminder->due_date) : null;
            $dueOdometer = $reminder->due_odometer;
            $dueHours    = $reminder->due_hours;
            $vehicle     = $reminder->vehicle;

            $newStatus = $this->calculateStatus($vehicle, $dueOdometer, $dueDate, $dueHours ? Carbon::now() : null);

            if ($newStatus !== $reminder->status) {
                $reminder->update(['status' => $newStatus]);
                $updated++;
            }
        }

        return $updated;
    }
}
