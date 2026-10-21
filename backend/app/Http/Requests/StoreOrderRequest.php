<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
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
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:50'],
            'phone' => ['required', 'string', 'max:12', 'regix:/^\+?[0-9\s().-]+$/'],
            'city' => ['required', 'string', 'max:50'],
            'address' => ['required', 'text'],
            'idempotency_key' => ['required', 'string', 'uuid'],
            'items' => ['required', 'array', 'min:1', 'max:99'],
            'items.*' => ['required', 'array:product_id,quantite'],
            'items.*.product_id' => ['required', Rule::exists('products', 'id')->where('is_active', true)],
            'items.*.quantite' => ['required', 'integer', 'min:1', 'max:99']
        ];
    }
}
