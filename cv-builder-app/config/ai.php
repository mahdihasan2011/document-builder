<?php

return [
    'openai_key' => env('OPENAI_API_KEY', null),
    'default_model' => env('AI_MODEL', 'gpt-4o-mini'),
    'social' => [
        'meta_token' => env('META_GRAPH_TOKEN', null),
    ],
];
