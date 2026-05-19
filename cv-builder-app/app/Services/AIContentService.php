<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AIContentService
{
    public function generateSEOContent(string $type, string $slug): array
    {
        $apiKey = config('ai.openai_key');
        $model = config('ai.default_model', 'gpt-4o-mini');

        $prompt = "Generate a JSON object with keys: title, meta, content, faqs (array of {question,answer}) for a {$type} page about '{$slug}'. Keep meta <= 160 chars and return only JSON.";

        if (!$apiKey) {
            return [
                'title' => ucfirst(str_replace('-', ' ', $slug)),
                'meta' => 'AI key not configured. Set OPENAI_API_KEY in your .env',
                'content' => '<p>OpenAI API key is not configured.</p>',
                'faqs' => [],
            ];
        }

        $response = Http::withHeaders(['Authorization' => "Bearer {$apiKey}"])
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                'max_tokens' => 800,
                'temperature' => 0.7,
            ]);

        if (!$response->ok()) {
            return [
                'title' => ucfirst(str_replace('-', ' ', $slug)),
                'meta' => 'Temporary content unavailable.',
                'content' => '<p>AI service error: ' . $response->status() . '</p>',
                'faqs' => [],
            ];
        }

        $body = $response->json();
        $text = $body['choices'][0]['message']['content'] ?? $response->body();

        $json = $this->parseJsonResponse($text);
        if (is_array($json)) {
            return array_merge(['title' => '', 'meta' => '', 'content' => '', 'faqs' => []], $json);
        }

        // Fallback: wrap raw text
        return [
            'title' => substr(strip_tags($text), 0, 70),
            'meta' => substr(strip_tags($text), 0, 160),
            'content' => $text,
            'faqs' => [],
        ];
    }

    public function analyzeResumeForATS(string $resumeText): array
    {
        $apiKey = config('ai.openai_key');
        $model = config('ai.default_model', 'gpt-4o-mini');

        if (!$apiKey) {
            return [
                'score' => 0,
                'issues' => ['OpenAI API key is not configured. Set OPENAI_API_KEY in your .env file.'],
                'recommendations' => [],
                'improved_resume' => '',
            ];
        }

        $prompt = "You are an expert resume reviewer focused on ATS compatibility. Review the resume text below and return only valid JSON with keys: score (number 0-100), issues (array of strings), recommendations (array of strings), improved_resume (string). " .
            "Focus on section headings, layout, bullet points, dates, keywords, line spacing, fonts, contact information, and ATS-friendly formatting. " .
            "If the text is already ATS-friendly, provide a score of 85 or above and suggest minor improvements. Do not include markdown formatting in improved_resume unless it is plain resume text.\n\nResume text:\n{$resumeText}";

        $response = Http::withHeaders(['Authorization' => "Bearer {$apiKey}"])
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                'max_tokens' => 900,
                'temperature' => 0.3,
            ]);

        if (!$response->ok()) {
            return [
                'score' => 0,
                'issues' => ['AI service error: ' . $response->status()],
                'recommendations' => [],
                'improved_resume' => '',
            ];
        }

        $body = $response->json();
        $text = $body['choices'][0]['message']['content'] ?? $response->body();

        $json = $this->parseJsonResponse($text);
        if (is_array($json)) {
            return array_merge([
                'score' => 0,
                'issues' => [],
                'recommendations' => [],
                'improved_resume' => '',
            ], $json);
        }

        return [
            'score' => 0,
            'issues' => ['Unable to parse ATS review output from AI.'],
            'recommendations' => ['Ensure the resume text is clear and structured, then retry.'],
            'improved_resume' => strip_tags($text),
        ];
    }

    private function parseJsonResponse(string $text): ?array
    {
        $json = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
            return $json;
        }

        if (preg_match('/(\{(?:[^{}]|(?R))*\})/s', $text, $matches)) {
            $json = json_decode($matches[1], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
                return $json;
            }
        }

        return null;
    }
}
