<?php

namespace App;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

trait ApiResponseTrait
{
    protected function ok(
        mixed $data = null,
        string $message = 'ok',
        int $status = 200,
        array $headers = []
    ) : JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'meta' => [
                'current_page' => $data->currentPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
                'last_page' => $data->lastPage()
            ],
            'links' => [
                'first' => $data->url(1),
                'prev' => $data->previousPageUrl(),
                'next' => $data->nextPageUrl(),
                'last' => $data->url($data->lastPage())
            ],
            'errors' => null
        ], $status, $headers);
    }

    protected function  okNoPgs(
        mixed $data = null,
        string $message = 'ok',
        int $status = 200,
        array $headers = []
    ) : JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'errors' => null
        ], $status, $headers);
    }

    protected function created(
        mixed $data,
        string $message = 'Created successfully'
    ) : JsonResponse
    {
        return $this->okNoPgs($data, $message, 201);
    }

    protected function noContent() : Response
    {
        return response()->noContent();
    }

    protected function fail(
        string $message = 'Something went wrong.',
        int $status = 400,
        ?array $errors = null
    )
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => null,
            'errors' => $errors
        ], $status);
    }
}
