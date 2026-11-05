<?php

namespace App\Http\Requests\V1;

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
        // customers can only filter by active categories, admins by any
        $category = Rule::exists('categories', 'slug');
        if (! $this->routeIs('admin.*')) {
            $category->where('is_active', true);
        }

        return [
            'q' => 'nullable|string|max:100',
            'category' => ['nullable', $category],
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'sort' => 'nullable|in:price_desc,price_asc,newest,oldest'
        ];
    }
}
