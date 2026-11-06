<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\Queue;
use PDOException;
use RuntimeException;
use Tests\Concerns\BuildsOrderPayload;
use Tests\TestCase;

class ErrorResponsesTest extends TestCase
{
    use BuildsOrderPayload, RefreshDatabase;

    public function test_every_response_has_a_request_id_header(): void
    {
        $this->getJson('/api/status')->assertOk()->assertHeader('X-Request-Id');
    }

    public function test_a_client_cannot_choose_its_request_id(): void
    {
        $response = $this->getJson('/api/status', ['X-Request-Id' => 'forged']);

        $this->assertNotSame('forged', $response->headers->get('X-Request-Id'));
    }

    public function test_errors_carry_the_same_request_id_as_the_header(): void
    {
        $response = $this->getJson('/api/v1/no-such-endpoint')->assertNotFound();

        $this->assertNotEmpty($response->json('request_id'));
        $this->assertSame($response->headers->get('X-Request-Id'), $response->json('request_id'));
    }

    public function test_validation_and_stock_errors_carry_a_request_id(): void
    {
        Queue::fake();

        $this->getJson('/api/v1/products?sort=nonsense')->assertUnprocessable()->assertJsonStructure(['request_id']);

        $product = Product::factory()->create(['stock' => 0]);
        $response = $this->postJson('/api/v1/orders', $this->orderPayload([
            ['product_id' => $product->id, 'quantity' => 1],
        ]))->assertBadRequest();

        $this->assertNotEmpty($response->json('request_id'));
    }

    public function test_the_request_id_is_added_to_the_context(): void
    {
        $response = $this->getJson('/api/status');

        $this->assertSame($response->headers->get('X-Request-Id'), Context::get('request_id'));
    }

    public function test_any_other_query_error_is_still_a_500(): void
    {
        config(['app.debug' => false]);

        $this->mock(ProductService::class)->shouldReceive('getProducts')->andThrow(new QueryException(
            'mysql', 'select secret from table', [], new PDOException('SQLSTATE[42S02] Table not found'),
        ));

        $response = $this->getJson('/api/v1/products');

        $response->assertServerError();
        $this->assertStringNotContainsString('secret', $response->getContent());
    }

    public function test_production_errors_hide_the_real_message(): void
    {
        config(['app.debug' => false]);

        $this->mock(ProductService::class)->shouldReceive('getProducts')->andThrow(new RuntimeException('internal path /var/www'));

        $response = $this->getJson('/api/v1/products')->assertServerError();

        $this->assertStringNotContainsString('/var/www', $response->getContent());
        $this->assertNotEmpty($response->json('request_id'));
    }
}
