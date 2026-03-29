<?php

use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\Resume;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ResumeController;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting Verification (Unified Root)...\n";

// 1. Verify Schema
echo "1. Checking Schema...\n";
if (Schema::hasTable('users') && Schema::hasTable('resumes')) {
    echo "   [PASS] Tables exist.\n";
} else {
    echo "   [FAIL] Tables missing.\n";
}

// 2. Test Auth Flow (Register/Login)
echo "2. Testing Auth Flow...\n";
$phone = '1234567890';
$otp = '1234';

// Simulate Send OTP
$authController = new AuthController();
$req = Request::create('/api/auth/send-otp', 'POST', ['phone' => $phone]);
$res = $authController->sendOtp($req);
if ($res->getStatusCode() == 200) {
    echo "   [PASS] Send OTP success.\n";
} else {
    echo "   [FAIL] Send OTP failed.\n";
}

// Simulate Verify OTP
$req = Request::create('/api/auth/verify-otp', 'POST', ['phone' => $phone, 'otp' => $otp]);
$res = $authController->verifyOtp($req);
$data = json_decode($res->getContent(), true);

$token = null;
$userId = null;

if (isset($data['token']) && isset($data['user'])) {
    echo "   [PASS] Verify OTP success. Token: " . substr($data['token'], 0, 10) . "...\n";
    $token = $data['token'];
    $userId = $data['user']['id'];
} else {
    echo "   [FAIL] Verify OTP failed.\n";
}

// 3. Test Resume Save
if ($token) {
    echo "3. Testing Resume Save...\n";
    $resumeData = ['skills' => ['PHP', 'Laravel'], 'experience' => 'Senior Dev'];
    $templateId = 'modern_1';

    $resumeController = new ResumeController();
    $req = Request::create('/api/user/resume', 'POST', [
        'resume_data' => $resumeData, 
        'template_id' => $templateId
    ]);
    
    $req->headers->set('Authorization', 'Bearer ' . $token);
    
    $res = $resumeController->save($req);
    $data = json_decode($res->getContent(), true);

    if ($data['success'] === true && isset($data['resume']['id'])) {
        echo "   [PASS] Resume saved. ID: " . $data['resume']['id'] . "\n";
    } else {
        echo "   [FAIL] Resume save failed.\n";
    }

    // 4. Test Resume Profile Fetch
    echo "4. Testing Resume Profile Fetch...\n";
    $req = Request::create('/api/user/profile', 'GET');
    $req->headers->set('Authorization', 'Bearer ' . $token);

    $res = $resumeController->profile($req);
    $data = json_decode($res->getContent(), true);

    if ($data['success'] === true && isset($data['resume_data']['experience'])) {
        echo "   [PASS] Profile validation success.\n";
    } else {
        echo "   [FAIL] Profile validation failed.\n";
    }

    // 5. Database Consistency Check
    echo "5. Checking Database Consistency...\n";
    $resume = Resume::where('user_id', $userId)->first();
    if ($resume && $resume->user_id === $userId) {
         echo "   [PASS] Database record matches.\n";
    } else {
         echo "   [FAIL] Database mismatch.\n";
    }

} else {
    echo "Skipping Step 3, 4, 5 due to auth failure.\n";
}

echo "\nverification_complete\n";
