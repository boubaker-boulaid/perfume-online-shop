<?php

namespace App\Http\Requests\V1;

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

    // customers type the same number in many ways: keep only the + and the digits
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('phone'))) {
            $this->merge(['phone' => preg_replace('/[\s().-]/', '', $this->input('phone'))]);
        }
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
            'phone' => ['required', 'string', 'regex:/^(?:\+212|00212|0)[5-7][0-9]{8}$/'],
            'city' => ['required', 'string', 'max:50'],
            'address' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'note' => ['nullable', 'string', 'max:255'],
            'idempotency_key' => ['required', 'string', 'uuid'],
            'items' => ['required', 'array', 'min:1', 'max:99'],
            'items.*' => ['required', 'array:product_id,quantity'],
            'items.*.product_id' => ['required', 'distinct', Rule::exists('products', 'id')->where('is_active', true)
                ->where(fn($q) => $q->whereIn('category_id', fn($categories) => $categories->select('id')->from('categories')->where('is_active', true)))],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99']
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Please enter a valid Moroccan phone number.',
        ];
    }
}
