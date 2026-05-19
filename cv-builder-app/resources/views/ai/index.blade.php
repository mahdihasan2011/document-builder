<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Endpoint Usage</title>
    <style>
        body {
            font-family: Inter, system-ui, sans-serif;
            line-height: 1.6;
            padding: 2rem;
            background: #f9fafb;
            color: #111827;
        }

        h1 {
            margin-bottom: 1rem;
        }

        code {
            background: #e5e7eb;
            padding: 0.2rem 0.4rem;
            border-radius: 0.3rem;
        }

        pre {
            background: #111827;
            color: #f9fafb;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
        }

        .box {
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }
    </style>
</head>

<body>
    <h1>AI Endpoint Usage</h1>
    <div class="box">
        <p>This is an AI helper endpoint page. These endpoints are designed for <strong>POST</strong> requests with JSON
            payloads.</p>
    </div>
    <div class="box">
        <h2>Resume ATS review</h2>
        <p>Use:</p>
        <pre>POST /ai/ats-review</pre>
        <p>Payload:</p>
        <pre>{
  "resume": "Your resume text here..."
}</pre>
    </div>
    <div class="box">
        <h2>Resume review</h2>
        <p>Use:</p>
        <pre>POST /ai/review-resume</pre>
        <p>This endpoint also expects a JSON body with <code>resume</code>.</p>
    </div>
    <div class="box">
        <h2>Generate cover letter</h2>
        <p>Use:</p>
        <pre>POST /ai/generate-cover</pre>
        <p>Payload:</p>
        <pre>{
  "job_title": "Marketing Manager",
  "name": "Jane Doe"
}</pre>
    </div>
    <div class="box">
        <h2>Why you saw 405</h2>
        <p>A browser or link likely accessed one of these endpoints via GET. These routes handle POST requests for API
            workflows, so we now show this usage page instead.</p>
    </div>
</body>

</html>