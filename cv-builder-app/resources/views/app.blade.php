<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name', 'ATS Friendly Resume Builder') }}</title>
        <meta name="description" content="Create a professional, ATS-optimized resume in minutes with our AI-powered builder. Land your dream job with templates that recruiters love.">
        <meta name="keywords" content="resume builder, ATS friendly resume, CV maker, AI resume, career tools, professional CV templates">
        <meta name="author" content="{{ config('app.name', 'ATS Friendly Resume Builder') }}">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ config('app.name', 'ATS Friendly Resume Builder') }} | AI-Powered CV Maker">
        <meta property="og:description" content="Create a professional, ATS-optimized resume in minutes with our AI-powered builder.">
        <meta property="og:image" content="{{ asset('assets/og-image.png') }}">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ url()->current() }}">
        <meta property="twitter:title" content="{{ config('app.name', 'ATS Friendly Resume Builder') }} | AI-Powered CV Maker">
        <meta property="twitter:description" content="Create a professional, ATS-optimized resume in minutes with our AI-powered builder.">
        <meta property="twitter:image" content="{{ asset('assets/og-image.png') }}">

        <link rel="canonical" href="{{ url()->current() }}">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/index.tsx'])

        <!-- Google AdSense -->
        @if(env('VITE_ADSENSE_CLIENT'))
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ env('VITE_ADSENSE_CLIENT') }}" crossorigin="anonymous"></script>
        @endif
    </head>
    <body class="antialiased">
        <div id="root"></div>
    </body>
</html>
