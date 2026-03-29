<?php
// Helper script to run Artisan commands on cPanel
$app = require_once __DIR__ . '/../cv-builder-app/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);

// Link Storage (for user uploads/PDFs if used)
$kernel->call('storage:link');
echo "Storage Linked successfully!<br>";

// Run Migrations (Populate Database tables)
$kernel->call('migrate', ['--force' => true]);
echo "Migrations ran successfully!<br>";

// Cache configuration for fast loading
$kernel->call('config:cache');
$kernel->call('route:cache');
$kernel->call('view:cache');
echo "App Cached successfully!";
