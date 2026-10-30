<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = config('shop.admin.password') ?: throw new \RuntimeException('SHOP_ADMIN_PASSWORD is not set.');
        $email = config('shop.admin.email') ?: throw new \RuntimeException('SHOP_ADMIN_EMAIL is not set.');
        $name = config('shop.admin.name') ?: throw new \RuntimeException('SHOP_ADMIN_NAME is not set.');

        User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'is_admin' => true,
            'email_verified_at' => now(),
            'remember_token' => Str::random(10)
        ]);
    }
}
