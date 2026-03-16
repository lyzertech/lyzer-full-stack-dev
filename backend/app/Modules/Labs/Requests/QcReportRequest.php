<?php

namespace App\Modules\Labs\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QcReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sample_id' => ['required', 'string', 'max:100'],
            'test_name' => ['required', 'string', 'max:255'],
            'result'    => ['required', 'in:pass,fail,pending'],
            'notes'     => ['nullable', 'string'],
            'tested_at' => ['required', 'date'],
        ];
    }
}
