<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FiltersRequest extends FormRequest
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
            'q' => 'nullable|string|max:100',
            'category' => 'nullable|exists:categories,slug',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => ['nullable', Rule::exists('categories', 'slug')->where('is_active', true)],
            'sort' => 'nullable|in:price_desc,price_asc, newest, oldest'
        ];
    }
}
