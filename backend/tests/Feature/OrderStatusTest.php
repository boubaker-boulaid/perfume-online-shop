<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class OrderStatusTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        Sanctum::actingAs($this->admin);
    }

    #[DataProvider('illegalChanges')]
    public function test_illegal_status_changes_are_refused(string $from, string $to): void
    {
        $order = Order::factory()->create(['status' => $from]);

        $this->patchJson($this->url($order), ['status' => $to])
            ->assertUnprocessable()
            ->assertJsonPath('message', "Cannot change order status from {$from} to {$to}.");

        $this->assertSame($from, $order->fresh()->status);
        $this->assertDatabaseCount('order_status_history', 0);
    }

    // written out by hand instead of read from Order::TRANSITIONS: a wrong edit of that constant must fail here
    public static function illegalChanges(): array
    {
        $illegal = [
            'pending' => ['pending', 'shipped', 'delivered'],
            'confirmed' => ['pending', 'confirmed', 'delivered'],
            'shipped' => ['pending', 'confirmed', 'shipped', 'cancelled'],
            'delivered' => ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            'cancelled' => ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        ];

        $cases = [];
        foreach ($illegal as $from => $statuses) {
            foreach ($statuses as $to) {
                $cases["{$from} to {$to}"] = [$from, $to];
            }
        }

        return $cases;
    }

    #[DataProvider('legalChanges')]
    public function test_legal_status_changes_are_saved_with_their_history(string $from, string $to): void
    {
        $order = Order::factory()->create(['status' => $from]);

        $this->patchJson($this->url($order), ['status' => $to, 'note' => 'Checked by phone'])
            ->assertOk()
            ->assertJsonPath('data.status', $to)
            ->assertJsonPath('data.history.0.changed_by', $this->admin->name);

        $this->assertSame($to, $order->fresh()->status);
        $this->assertDatabaseHas('order_status_history', [
            'order_id' => $order->id,
            'user_id' => $this->admin->id,
            'from_status' => $from,
            'to_status' => $to,
            'note' => 'Checked by phone',
        ]);
    }

    public static function legalChanges(): array
    {
        return [
            'pending to confirmed' => ['pending', 'confirmed'],
            'pending to cancelled' => ['pending', 'cancelled'],
            'confirmed to shipped' => ['confirmed', 'shipped'],
            'confirmed to cancelled' => ['confirmed', 'cancelled'],
            'shipped to delivered' => ['shipped', 'delivered'],
        ];
    }

    // cash on delivery: the money is collected when the order is delivered
    public function test_only_delivering_marks_the_order_as_paid(): void
    {
        $order = Order::factory()->create();

        foreach (['confirmed', 'shipped'] as $status) {
            $this->patchJson($this->url($order), ['status' => $status])->assertOk();
            $this->assertSame('unpaid', $order->fresh()->payment_status);
        }

        $this->patchJson($this->url($order), ['status' => 'delivered'])->assertOk();
        $this->assertSame('paid', $order->fresh()->payment_status);
    }

    public function test_an_unknown_status_is_rejected(): void
    {
        $order = Order::factory()->create();

        $this->patchJson($this->url($order), ['status' => 'refunded'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $this->assertSame('pending', $order->fresh()->status);
    }

    private function url(Order $order): string
    {
        return "/api/v1/admin/orders/{$order->order_number}/status";
    }
}
