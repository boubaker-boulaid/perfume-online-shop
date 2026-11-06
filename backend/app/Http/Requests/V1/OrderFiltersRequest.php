<?php

namespace App\Http\Requests\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class OrderFiltersRequest extends FormRequest
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
            'q' => 'nullable|string|max:100', // order number, customer name or phone
            'status' => 'nullable|in:pending,confirmed,shipped,delivered,cancelled',
            'payment_status' => 'nullable|in:unpaid,paid',
            'city' => 'nullable|string|max:50',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'older_than_hours' => 'nullable|integer|min:1', // e.g. pending orders older than 24h to follow up on
            'sort' => 'nullable|in:newest,oldest,total_desc,total_asc',
        ];
    }
}
