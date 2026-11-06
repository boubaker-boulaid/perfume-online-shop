<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_can_be_requested(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function (object $notification) use ($user) {
            $response = $this->post('/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

            $response
                ->assertSessionHasNoErrors()
                ->assertStatus(200);

            return true;
        });
    }

    public function test_forgot_password_does_not_reveal_which_emails_have_an_account(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $known = $this->postJson('/forgot-password', ['email' => $user->email])->assertOk();
        $unknown = $this->postJson('/forgot-password', ['email' => 'nobody@example.com'])->assertOk();

        $this->assertSame($known->json(), $unknown->json());
    }

    public function test_reset_password_does_not_reveal_which_emails_have_an_account(): void
    {
        $user = User::factory()->create();
        $fields = ['token' => 'wrong', 'password' => 'new-password', 'password_confirmation' => 'new-password'];

        $known = $this->postJson('/reset-password', [...$fields, 'email' => $user->email])->assertUnprocessable();
        $unknown = $this->postJson('/reset-password', [...$fields, 'email' => 'nobody@example.com'])->assertUnprocessable();

        $this->assertSame($known->json('errors'), $unknown->json('errors'));
    }
}
