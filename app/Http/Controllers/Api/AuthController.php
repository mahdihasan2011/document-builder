<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        // In a real app, send SMS. For now, we simulate success.
        // We ensure the user exists or will be created on verify.
        // Actually, verify_db logic implies we just return success here.
        
        return response()->json(['message' => 'OTP sent successfully']);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'otp' => 'required|string',
        ]);

        // Simple OTP verify simulation
        if ($request->otp !== '1234') {
             return response()->json(['message' => 'Invalid OTP'], 400);
        }

        $user = User::firstOrCreate(
            ['phone' => $request->phone],
            ['name' => 'User ' . substr($request->phone, -4)]
        );

        // Generate simple token
        $token = Str::random(60);
        $user->forceFill(['api_token' => $token])->save();

        return response()->json([
            'status' => 'success',
            'token' => $token,
            'user' => $user
        ]);
    }
}
