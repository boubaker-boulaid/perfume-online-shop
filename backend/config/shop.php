<?php

return [
    // A public demo of the shop (a portfolio project): the catalog is fake, and
    // "php artisan shop:demo-reset" may wipe and re-seed the database. Never on a real shop.
    'demo' => (bool) env('SHOP_DEMO', false),

    'whatsapp' => [
        'number' => env('SHOP_WHATSAPP_NUMBER') ?: '212600000000',
    ],

    'admin' => [
        'name' => env('SHOP_ADMIN_NAME'),
        'email' => env('SHOP_ADMIN_EMAIL'),
        'password' => env('SHOP_ADMIN_PASSWORD'),
    ],

    'mail' => [
        'address' => env('SHOP_MAIL_ADDRESS') ?: 'lume-perfums@gmail.com',
    ],
];
