<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class CorsTest extends TestCase
{
    public static function frontendPostRoutes(): array
    {
        return [
            'login' => ['/login'],
            'logout' => ['/logout'],
            'forgot password' => ['/forgot-password'],
            'reset password' => ['/reset-password'],
            'place an order' => ['/api/v1/orders'],
        ];
    }

    #[DataProvider('frontendPostRoutes')]
    public function test_the_frontend_is_allowed_to_call(string $url): void
    {
        $origin = config('cors.allowed_origins')[0];

        $response = $this->call('OPTIONS', $url, server: [
            'HTTP_ORIGIN' => $origin,
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
        ]);

        $this->assertSame($origin, $response->headers->get('Access-Control-Allow-Origin'));
    }
}
