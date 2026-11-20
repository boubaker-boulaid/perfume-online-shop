<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Concerns\BuildsOrderPayload;
use Tests\TestCase;

class OrderPhoneTest extends TestCase
{
    use BuildsOrderPayload, RefreshDatabase;

    private function placeWithPhone(mixed $phone)
    {
        Queue::fake();
        $product = Product::factory()->create(['stock' => 5]);

        return $this->postJson('/api/v1/orders', $this->orderPayload(
            [['product_id' => $product->id, 'quantity' => 1]],
            ['phone' => $phone],
        ));
    }

    public static function validPhones(): array
    {
        return [
            'local' => ['0612345678', '0612345678'],
            'local with spaces' => ['06 12 34 56 78', '0612345678'],
            'local with dashes' => ['06-12-34-56-78', '0612345678'],
            'international' => ['+212612345678', '+212612345678'],
            'international with spaces' => ['+212 6 12 34 56 78', '+212612345678'],
            'with 00' => ['00212712345678', '00212712345678'],
            'landline' => ['0528123456', '0528123456'],
        ];
    }

    #[DataProvider('validPhones')]
    public function test_a_moroccan_number_is_accepted_and_saved_without_formatting(string $typed, string $saved): void
    {
        $this->placeWithPhone($typed)->assertCreated();

        $this->assertSame($saved, Order::first()->phone);
    }

    public static function invalidPhones(): array
    {
        return [
            'only symbols' => ['-----'],
            'too short' => ['1'],
            'too long' => ['06123456789'],
            'wrong first digit' => ['0112345678'],
            'foreign' => ['+33612345678'],
            'letters' => ['06abcdefgh'],
            'not a string' => [[612345678]],
        ];
    }

    #[DataProvider('invalidPhones')]
    public function test_anything_else_is_refused(mixed $phone): void
    {
        $this->placeWithPhone($phone)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['phone'], 'errors');

        $this->assertSame(0, Order::count());
    }
}
