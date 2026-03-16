<?php

namespace App\Modules\Labs\Services;

use App\Modules\Labs\Models\QcReport;
use Illuminate\Support\Facades\Auth;

class LabsService
{
    public function createReport(array $data): QcReport
    {
        return QcReport::create(array_merge($data, [
            'tested_by' => Auth::id(),
        ]));
    }

    public function updateReport(QcReport $report, array $data): QcReport
    {
        $report->update($data);
        return $report->fresh();
    }
}
