<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Lang;
use Tests\Concerns\BuildsOrderPayload;
use Tests\TestCase;

class FrenchAndMoroccoTest extends TestCase
{
    use BuildsOrderPayload, RefreshDatabase;

    public function test_the_shop_runs_in_french_on_morocco_time(): void
    {
        $this->assertSame('fr', config('app.locale'));
        $this->assertSame('Africa/Casablanca', config('app.timezone'));
    }

    public function test_every_laravel_validation_message_has_a_french_version(): void
    {
        $english = require base_path('vendor/laravel/framework/src/Illuminate/Translation/lang/en/validation.php');
        $french = require lang_path('fr/validation.php');

        foreach ($english as $rule => $message) {
            if ($rule !== 'custom' && $rule !== 'attributes') {
                $this->assertTrue(Lang::has("validation.{$rule}", 'fr', false), "Missing validation.{$rule}");
                $this->assertSame(array_keys((array) $message), array_keys((array) $french[$rule]), "Different shape: {$rule}");
            }
        }
    }

    public function test_validation_errors_are_in_french_with_french_field_names(): void
    {
        $product = Product::factory()->create();

        $this->postJson('/api/v1/orders', $this->orderPayload([['product_id' => $product->id, 'quantity' => 1]], ['customer_name' => '', 'phone' => '123']))
            ->assertStatus(422)
            ->assertJsonPath('message', 'Les données saisies ne sont pas valides.')
            ->assertJsonPath('errors.customer_name.0', 'Le champ nom est obligatoire.')
            ->assertJsonPath('errors.phone.0', 'Veuillez saisir un numéro de téléphone marocain valide.');
    }

    public function test_framework_errors_are_in_french(): void
    {
        $this->getJson('/api/v1/nothing-here')->assertStatus(404)->assertJsonPath('message', 'Cette adresse d’API n’existe pas.');
        $this->deleteJson('/api/v1/orders')->assertStatus(405)->assertJsonPath('message', 'Cette méthode n’est pas autorisée pour cette adresse.');
        $this->getJson('/api/v1/products/nothing-here')->assertStatus(404)->assertJsonPath('message', 'La ressource demandée est introuvable.');

        $order = Order::factory()->create();
        $this->getJson("/api/v1/orders/{$order->idempotency_key}/whatsapp?signature=wrong")
            ->assertStatus(403)
            ->assertJsonPath('message', 'Ce lien n’est plus valide.');
    }

    public function test_the_password_reset_email_is_in_french(): void
    {
        $mail = (new ResetPassword('token'))->toMail(User::factory()->create());

        $this->assertSame('Réinitialisation de votre mot de passe', $mail->subject);
        $this->assertSame('Réinitialiser le mot de passe', $mail->actionText);
    }

    public function test_a_lack_of_stock_is_explained_in_french(): void
    {
        $product = Product::factory()->create(['name' => 'Golden Dusk', 'stock' => 1]);

        $this->postJson('/api/v1/orders', $this->orderPayload([['product_id' => $product->id, 'quantity' => 3]]))
            ->assertStatus(400)
            ->assertJsonPath('message', 'Stock insuffisant pour Golden Dusk. Quantité demandée : 3, quantité disponible : 1.');
    }

    public function test_the_whatsapp_message_is_in_french(): void
    {
        $order = Order::factory()->create(['customer_name' => 'Sara', 'city' => 'Agadir', 'address' => '12 Avenue Hassan II', 'note' => null, 'shipping_cost' => 0]);
        $order->items()->delete();

        $message = $order->fresh()->whatsappMessage();

        $this->assertStringContainsString('Nouvelle commande', $message);
        $this->assertStringContainsString('Livraison : offerte', $message);
        $this->assertStringContainsString('Nom : Sara', $message);
        $this->assertStringContainsString('Ville : Agadir', $message);
        $this->assertStringContainsString('Adresse : 12 Avenue Hassan II', $message);
    }

    public function test_times_are_saved_in_morocco_time_and_the_api_still_sends_utc(): void
    {
        $this->assertSame('Africa/Casablanca', now()->timezoneName);

        // July 2026, when Morocco was still at UTC+1: at UTC+0 today the two times would be the same
        Carbon::setTestNow(Carbon::parse('2026-07-01 12:00:00', 'UTC')->setTimezone(config('app.timezone')));

        $order = Order::factory()->create();

        $this->assertSame('13:00', $order->fresh()->created_at->format('H:i'), 'an email shows the Moroccan time');
        $this->assertSame('2026-07-01T12:00:00.000000Z', $order->fresh()->created_at->toISOString());

        Carbon::setTestNow();
    }
}
