<?php

namespace App\Modules\School\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:255'],
            'student_id'    => ['required', 'string', 'max:50', 'unique:school_students,student_id,' . $this->route('student')],
            'gender'        => ['required', 'in:male,female'],
            'date_of_birth' => ['required', 'date'],
            'class'         => ['required', 'string', 'max:50'],
            'email'         => ['nullable', 'email'],
            'phone'         => ['nullable', 'string', 'max:20'],
            'address'       => ['nullable', 'string'],
        ];
    }
}
