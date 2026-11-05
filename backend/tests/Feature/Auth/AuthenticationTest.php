<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertNoContent();
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertNoContent();
    }

    public function test_logging_in_while_already_logged_in_returns_json(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertConflict()->assertJsonPath('success', false);
    }

    public function test_guests_can_still_reach_the_password_routes(): void
    {
        $this->postJson('/forgot-password', ['email' => 'nobody@example.com'])->assertUnprocessable();
    }
}
