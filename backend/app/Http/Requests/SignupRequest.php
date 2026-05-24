<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SignupRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255', 'unique:auth_users,email'],
            'password' => ['required', 'string', 'min:6'],
            'displayName' => ['nullable', 'string', 'max:255'],
        ];
    }
}
