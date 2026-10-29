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
        User::create([
            'name' => config('shop.admin.name'),
            'email' => config('shop.admin.email'),
            'password' => Hash::make(config('shop.admin.password')),
            'is_admin' => true,
            'email_verified_at' => now(),
            'remember_token' => Str::random(10)
        ]);
    }
}
