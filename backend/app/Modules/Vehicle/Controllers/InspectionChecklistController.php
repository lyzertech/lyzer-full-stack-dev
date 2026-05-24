<?php

namespace App\Modules\Vehicle\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Vehicle\Models\InspectionChecklist;
use App\Modules\Vehicle\Models\InspectionChecklistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InspectionChecklistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = InspectionChecklist::with(['vehicle', 'driver'])->orderBy('inspection_date', 'desc');

        if ($request->filled('vehicle_id'))      $query->where('vehicle_id', $request->integer('vehicle_id'));
        if ($request->filled('overall_status'))  $query->where('overall_status', $request->string('overall_status'));
        if ($request->filled('inspection_type')) $query->where('inspection_type', $request->string('inspection_type'));
        if ($request->filled('start_date'))      $query->where('inspection_date', '>=', $request->string('start_date'));
        if ($request->filled('end_date'))        $query->where('inspection_date', '<=', $request->string('end_date'));

        $perPage = min($request->integer('per_page', 15), 100);
        return response()->json($query->paginate($perPage));
    }

    public function show(InspectionChecklist $inspectionChecklist): JsonResponse
    {
        $inspectionChecklist->load(['vehicle', 'driver', 'items']);
        return response()->json($inspectionChecklist);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'vehicle_id'      => ['required', 'integer', 'exists:vehicles,id'],
            'driver_id'       => ['nullable', 'integer', 'exists:vehicle_drivers,id'],
            'inspector_id'    => ['nullable', 'integer'],
            'inspection_date' => ['required', 'date'],
            'inspection_type' => ['nullable', 'in:Pre-Trip,Post-Trip,Daily,Weekly,Monthly,Periodic'],
            'odometer'        => ['nullable', 'numeric', 'min:0'],
            'general_notes'   => ['nullable', 'string'],
            'items'           => ['required', 'array', 'min:1'],
            'items.*.check_item'         => ['required', 'string', 'max:200'],
            'items.*.category'           => ['nullable', 'string', 'max:100'],
            'items.*.result'             => ['required', 'in:Good,Warning,Critical,Not Checked'],
            'items.*.technician_notes'   => ['nullable', 'string'],
        ]);

        return DB::transaction(function () use ($data) {
            // Generate number
            $year = Carbon::now()->format('Y');
            $month = Carbon::now()->format('m');
            $last = InspectionChecklist::whereYear('created_at', $year)->count() + 1;
            $data['checklist_number'] = "INS-{$year}{$month}-" . str_pad($last, 4, '0', STR_PAD_LEFT);

            // Calculate health score
            $items = $data['items'];
            $totalItems = count($items);
            $criticalCount = count(array_filter($items, fn($i) => $i['result'] === 'Critical'));
            $warningCount  = count(array_filter($items, fn($i) => $i['result'] === 'Warning'));
            $healthScore = max(0, 100 - ($criticalCount * 20) - ($warningCount * 5));

            $overallStatus = 'Good';
            if ($criticalCount > 0) $overallStatus = 'Critical';
            elseif ($warningCount > 0) $overallStatus = 'Warning';

            $data['overall_status'] = $overallStatus;
            $data['health_score']   = $healthScore;
            $data['inspector_id']   = $data['inspector_id'] ?? auth()->id();

            $checklist = InspectionChecklist::create($data);

            foreach ($items as $item) {
                InspectionChecklistItem::create([
                    'checklist_id'     => $checklist->id,
                    'check_item'       => $item['check_item'],
                    'category'         => $item['category'] ?? null,
                    'result'           => $item['result'],
                    'technician_notes' => $item['technician_notes'] ?? null,
                ]);
            }

            $checklist->load(['vehicle', 'driver', 'items']);
            return response()->json($checklist, 201);
        });
    }

    public function destroy(InspectionChecklist $inspectionChecklist): JsonResponse
    {
        $inspectionChecklist->delete();
        return response()->json(['message' => 'Inspection deleted']);
    }
}
