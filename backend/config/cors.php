<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://finance.lyzer.test:3000',
        'http://labs.lyzer.test:3000',
        'http://school.lyzer.test:3000',
        'http://lyzer.test',
    ],

    'allowed_origins_patterns' => [
        '#^http://[a-z]+\.lyzer\.test(:\d+)?$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
