<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>ATS Friendly Resume/CV Builder</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
        @vite(['resources/css/app.css', 'resources/js/index.tsx'])
    </head>
    <body class="antialiased">
        <div id="root"></div>
    </body>
</html>
