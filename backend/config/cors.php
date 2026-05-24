<?php

$extraOrigins = array_values(array_filter(array_map(
    'trim',
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))
)));

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | API auth uses auth_user_sessions + Bearer token. Add production frontend
    | URLs via CORS_ALLOWED_ORIGINS in .env (comma-separated).
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_unique(array_merge([
        'http://localhost:3000',
        'https://localhost:3000',
        'http://finance.lyzer.test:3000',
        'http://labs.lyzer.test:3000',
        'http://school.lyzer.test:3000',
        'http://lyzer.test',
    ], $extraOrigins))),

    'allowed_origins_patterns' => [
        '#^https?://[a-z0-9-]+\.lyzer\.test(:\d+)?$#',
        '#^https?://([a-z0-9-]+\.)*lyzer\.my\.id$#',
        '#^https?://lyzer\.my\.id$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
