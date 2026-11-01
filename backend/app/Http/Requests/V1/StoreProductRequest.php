<?php

namespace App\Http\Requests\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'sku' => ['nullable', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
            'compare_at_price' => ['nullable', 'numeric', 'decimal:0,2', 'gt:price'],
            'stock' => ['required', 'integer', 'min:0'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean']
        ];
    }
}
