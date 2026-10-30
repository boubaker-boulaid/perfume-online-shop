<?php

return [
    'whatsapp' => [
        'number' => env('SHOP_WHATSAPP_NUMBER', '212693303131')
    ],

    'admin' => [
        'name' => env('SHOP_ADMIN_NAME'),
        'email' => env('SHOP_ADMIN_EMAIL'),
        'password' => env('SHOP_ADMIN_PASSWORD'),
    ],

    'mail' => [
        'address' => env('SHOP_MAIL_ADDRESS', 'lume-perfums@gmail.com')
    ]
];