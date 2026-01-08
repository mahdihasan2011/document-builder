<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Resume;
use Illuminate\Support\Facades\Auth;

class ResumeController extends Controller
{
    // Ensure we protect these routes with middleware or manual token check
    // Since we are using simple tokens, manual check or middleware is needed.
    // Laravels 'auth:api' guard might not be set up for 'api_token' column without config.
    // For simplicity matching verify_db logic, I'll extract token manually or assume middleware works if configured.
    // But verify_db sets 'Authorization: Bearer ...'.
    // I'll implement a simple helper/trait or just do it inline for this refactor to be robust without deep config changes.
    
    private function getUser(Request $request)
    {
        $header = $request->header('Authorization');
        if (!$header) return null;
        
        $token = str_replace('Bearer ', '', $header);
        return \App\Models\User::where('api_token', $token)->first();
    }

    public function save(Request $request)
    {
        $user = $this->getUser($request);
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $request->validate([
            'resume_data' => 'required|array',
            'template_id' => 'required|string',
        ]);

        $resume = Resume::updateOrCreate(
            ['user_id' => $user->id],
            [
                'resume_data' => $request->resume_data,
                'template_id' => $request->template_id
            ]
        );

        return response()->json([
            'success' => true,
            'resume' => $resume
        ]);
    }

    public function profile(Request $request)
    {
        $user = $this->getUser($request);
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $resume = Resume::where('user_id', $user->id)->latest()->first();

        return response()->json([
            'success' => true,
            'user' => $user,
            'resume_data' => $resume ? $resume->resume_data : null,
            'template_id' => $resume ? $resume->template_id : 'modern',
        ]);
    }
}
