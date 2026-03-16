<?php

namespace App\Modules\Labs\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Labs\Models\QcReport;
use App\Modules\Labs\Requests\QcReportRequest;
use App\Modules\Labs\Services\LabsService;
use Illuminate\Http\JsonResponse;

class QcReportController extends Controller
{
    public function __construct(protected LabsService $service) {}

    public function index(): JsonResponse
    {
        $reports = QcReport::latest()->paginate(15);
        return response()->json($reports);
    }

    public function store(QcReportRequest $request): JsonResponse
    {
        $report = $this->service->createReport($request->validated());
        return response()->json($report, 201);
    }

    public function show(QcReport $qcReport): JsonResponse
    {
        return response()->json($qcReport);
    }

    public function update(QcReportRequest $request, QcReport $qcReport): JsonResponse
    {
        $updated = $this->service->updateReport($qcReport, $request->validated());
        return response()->json($updated);
    }

    public function destroy(QcReport $qcReport): JsonResponse
    {
        $qcReport->delete();
        return response()->json(['message' => 'QC Report deleted.']);
    }
}
