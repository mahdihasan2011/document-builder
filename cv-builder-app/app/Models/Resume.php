<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resume extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'resume_data',
        'template_id',
    ];

    protected $casts = [
        'resume_data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
