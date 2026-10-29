<?php

return [
    'whatsapp' => [
        'number' => env('SHOP_WHATSAPP_NUMBER', '212693303131')
    ],

    'admin' => [
        'name' => env('SHOP_ADMIN_NAME', 'Admin1'),
        'email' => env('SHOP_ADMIN_EMAIL', 'admin1@gmail.com'),
        'password' => env('SHOP_ADMIN_PASSWORD', 'password'),
    ],

    'mail' => [
        'address' => env('SHOP_MAIL_ADDRESS', 'lume-perfums@gmail.com')
    ]
];