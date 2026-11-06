<?php

namespace App\Http\Requests\V1;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
        // the old price is compared with the new price if one was sent, otherwise with the current one
        $price = is_numeric($this->input('price')) ? $this->input('price') : $this->route('product')->price;

        return [
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'sku' => ['nullable', 'string', 'max:100'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2', $this->belowSavedOldPrice()],
            'compare_at_price' => ['nullable', 'numeric', 'max:99999999.99', 'decimal:0,2', 'gt:'.$price],
            'stock' => ['sometimes', 'required', 'integer', 'min:0', 'max:2147483647'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:2147483647'],
            'image' => ['sometimes', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
        ];
    }

    // a new price alone can't reach the saved old price, or the shop would show a negative discount.
    // sending compare_at_price too (even null, to clear it) is checked by its own rule
    private function belowSavedOldPrice(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) {
            $oldPrice = $this->route('product')->compare_at_price;

            if (! $this->exists('compare_at_price') && $oldPrice !== null && is_numeric($value) && $value >= $oldPrice) {
                $fail("The price must be below the old price ({$oldPrice}). Change or clear compare_at_price too.");
            }
        };
    }
}
