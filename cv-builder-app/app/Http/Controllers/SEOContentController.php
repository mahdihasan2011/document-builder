<?php

namespace App\Http\Controllers;

use App\Services\AIContentService;
use Illuminate\Http\Request;

class SEOContentController extends Controller
{
    public function show(AIContentService $ai, Request $request, $type = null, $slug = null)
    {
        $data = $ai->generateSEOContent($type ?? $request->route('type'), $slug ?? $request->route('slug'));
        return view('seo.generator', ['data' => $data, 'type' => $type, 'slug' => $slug]);
    }

    public function reviewResume(AIContentService $ai, Request $request)
    {
        $resumeText = $request->input('resume');
        $result = $ai->generateSEOContent('resume-review', $resumeText ?: 'uploaded-resume');
        return response()->json($result);
    }

    public function atsReview(AIContentService $ai, Request $request)
    {
        $resumeText = trim($request->input('resume', ''));
        if (empty($resumeText)) {
            return response()->json(['error' => 'Resume text is required.'], 422);
        }

        $result = $ai->analyzeResumeForATS($resumeText);
        return response()->json($result);
    }

    public function generateCoverLetter(AIContentService $ai, Request $request)
    {
        $job = $request->input('job_title', 'the role');
        $name = $request->input('name', 'Applicant');
        $res = $ai->generateSEOContent('cover-letter', $job . ' for ' . $name);
        return response()->json($res);
    }
}
