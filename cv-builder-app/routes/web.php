<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
});


Route::get('/optimize', function () {
    Artisan::call('config:cache');
    Artisan::call('route:cache');
    Artisan::call('view:cache');
    return "Optimized!";
});

// AI-driven SEO content routes
Route::get('/resume-template/{slug}', [App\Http\Controllers\SEOContentController::class, 'show'])
    ->defaults('type', 'resume-template')
    ->name('seo.resume.template');

Route::get('/cv-example/{slug}', [App\Http\Controllers\SEOContentController::class, 'show'])
    ->defaults('type', 'cv-example')
    ->name('seo.cv.example');

Route::get('/cover-letter/{slug}', [App\Http\Controllers\SEOContentController::class, 'show'])
    ->defaults('type', 'cover-letter')
    ->name('seo.cover.letter');

// Simple AI endpoints for engagement features (placeholders)
Route::post('/ai/review-resume', [App\Http\Controllers\SEOContentController::class, 'reviewResume']);
Route::match(['get', 'post'], '/ai/ats-review', [App\Http\Controllers\SEOContentController::class, 'atsReview'])->name('ai.ats.review');
Route::post('/ai/generate-cover', [App\Http\Controllers\SEOContentController::class, 'generateCoverLetter']);

Route::get('/ai', function () {
    return response()->view('ai.index')->header('Content-Type', 'text/html');
});

Route::get('/ai/review-resume', function () {
    return response()->view('ai.index')->header('Content-Type', 'text/html');
});

Route::get('/ai/generate-cover', function () {
    return response()->view('ai.index')->header('Content-Type', 'text/html');
});

Route::get('/ai/test', function (App\Services\AIContentService $ai) {
    $data = $ai->generateSEOContent('resume-template', 'software-engineer');
    return response()->json($data);
});
