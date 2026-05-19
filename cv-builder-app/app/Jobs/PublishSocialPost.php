<?php

namespace App\Jobs;

use App\Services\SocialPosterService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PublishSocialPost implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public array $payload;
    public array $platforms;

    public function __construct(array $payload, array $platforms = [])
    {
        $this->payload = $payload;
        $this->platforms = $platforms;
    }

    public function handle(SocialPosterService $poster)
    {
        $poster->post($this->payload, $this->platforms);
    }
}
