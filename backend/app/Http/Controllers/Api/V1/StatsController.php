<?php

namespace App\Http\Controllers\Api\V1;

use App\ApiResponseTrait;
use App\Http\Controllers\Controller;
use App\Services\StatsService;

class StatsController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected StatsService $stats_service) {}

    public function index()
    {
        return $this->okNoPgs($this->stats_service->dashboard(), 'Stats retrieved.');
    }
}
