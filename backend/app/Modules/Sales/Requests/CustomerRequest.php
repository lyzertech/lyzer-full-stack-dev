<?php

namespace App\Modules\Sales\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => ['required', 'string', 'max:255'],
            'email'        => ['nullable', 'email', 'max:255'],
            'company'      => ['required', 'string', 'max:255'],
            'position'     => ['nullable', 'string', 'max:120'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'mobile_phone' => ['nullable', 'string', 'max:50'],
            'area'         => ['nullable', 'string', 'max:120'],
            'address'      => ['nullable', 'string'],
            'sales'        => ['nullable', 'string', 'max:120'],
            'category'     => ['nullable', 'string', 'max:120'],
            'status'       => ['nullable', 'in:Active,Inactive,Prospect,Blacklisted'],
            'notes'        => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'Full name is required.',
            'company.required' => 'Company name is required.',
            'email.email'      => 'Please enter a valid email address.',
        ];
    }
}
