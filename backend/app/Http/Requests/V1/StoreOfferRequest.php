<?php

namespace App\Http\Requests\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOfferRequest extends FormRequest
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
            // the set: a product marked is_offer, and not already used by another offer
            'product_id' => ['required', 'integer', Rule::exists('products', 'id')->where('is_offer', true), 'unique:offers,product_id'],
            'title' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'terms' => ['nullable', 'array', 'max:10'],
            'terms.*' => ['string', 'max:255'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'product_ids' => ['required', 'array', 'min:1', 'max:20'],
            'product_ids.*' => ['integer', 'distinct', Rule::exists('products', 'id')->where('is_offer', false)],
            'free_product_id' => ['nullable', 'integer', Rule::exists('products', 'id')->where('is_offer', false), Rule::notIn($this->input('product_ids', []))],
        ];
    }
}
