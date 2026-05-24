<?php

namespace App\Modules\Vehicle\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Vehicle\Models\ServiceReminder;
use App\Modules\Vehicle\Services\ReminderCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceReminderController extends Controller
{
    public function __construct(private ReminderCalculationService $reminderService) {}

    public function index(Request $request): JsonResponse
    {
        $query = ServiceReminder::with(['vehicle'])->orderBy('due_date');

        if ($request->filled('vehicle_id')) $query->where('vehicle_id', $request->integer('vehicle_id'));
        if ($request->filled('status'))     $query->where('status', $request->string('status'));
        if ($request->filled('type'))       $query->where('reminder_type', $request->string('type'));

        // Default: show non-completed
        if (!$request->boolean('show_all')) {
            $query->whereNotIn('status', ['completed', 'dismissed']);
        }

        $perPage = min($request->integer('per_page', 20), 100);
        return response()->json($query->paginate($perPage));
    }

    public function refresh(): JsonResponse
    {
        $updated = $this->reminderService->refreshAllStatuses();
        return response()->json(['message' => "Refreshed {$updated} reminder statuses"]);
    }

    public function dismiss(ServiceReminder $serviceReminder): JsonResponse
    {
        $serviceReminder->update(['status' => 'dismissed']);
        return response()->json(['message' => 'Reminder dismissed']);
    }

    public function complete(Request $request, ServiceReminder $serviceReminder): JsonResponse
    {
        $serviceReminder->update([
            'status'                   => 'completed',
            'completed_at'             => now(),
            'completed_work_order_id'  => $request->integer('work_order_id') ?: null,
        ]);
        return response()->json(['message' => 'Reminder marked complete']);
    }
}
