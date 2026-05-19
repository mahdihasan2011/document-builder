<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\URL;

class GenerateSitemap extends Command
{
    protected $signature = 'seo:generate-sitemap';
    protected $description = 'Generate a simple sitemap.xml (uses spatie/laravel-sitemap when available)';

    public function handle()
    {
        if (class_exists('\Spatie\Sitemap\SitemapGenerator')) {
            \Spatie\Sitemap\SitemapGenerator::create(config('app.url'))->writeToFile(public_path('sitemap.xml'));
            $this->info('sitemap.xml generated using spatie/laravel-sitemap.');
            return 0;
        }

        // Basic fallback sitemap containing common pages
        $urls = [
            config('app.url'),
            config('app.url') . '/resume-template/software-engineer',
            config('app.url') . '/cv-example/accountant',
            config('app.url') . '/cover-letter/marketing-manager',
        ];

        $items = '';
        foreach ($urls as $u) {
            $items .= "<url><loc>{$u}</loc></url>\n";
        }

        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" .
            "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n" .
            $items .
            "</urlset>\n";

        file_put_contents(public_path('sitemap.xml'), $xml);
        $this->info('Basic sitemap.xml written to public/sitemap.xml');
        return 0;
    }
}
