@extends('app')

@section('content')
    <main class="max-w-3xl mx-auto p-6">
        <h1>{{ $data['title'] ?? ($slug ?? 'AI Generated Page') }}</h1>

        @if(!empty($data['meta']))
            <meta name="description" content="{{ $data['meta'] }}">
        @endif

        <div class="prose mt-4">
            {!! $data['content'] ?? '<p>No content generated.</p>' !!}
        </div>

        @if(!empty($data['faqs']) && is_array($data['faqs']))
            <section class="mt-8">
                <h2>Frequently Asked Questions</h2>
                <dl>
                    @foreach($data['faqs'] as $f)
                        <dt><strong>{{ $f['question'] ?? '' }}</strong></dt>
                        <dd>{{ $f['answer'] ?? '' }}</dd>
                    @endforeach
                </dl>
            </section>
        @endif

        {{-- JSON-LD FAQ schema if available --}}
        @if(!empty($data['faqs']) && is_array($data['faqs']))
            @php
                $faqSchema = [
                    '@context' => 'https://schema.org',
                    '@type' => 'FAQPage',
                    'mainEntity' => array_map(function ($q) {
                        return [
                            '@type' => 'Question',
                            'name' => $q['question'] ?? '',
                            'acceptedAnswer' => [
                                '@type' => 'Answer',
                                'text' => $q['answer'] ?? '',
                            ],
                        ];
                    }, $data['faqs'])
                ];
            @endphp
            <script
                type="application/ld+json">{!! json_encode($faqSchema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) !!}</script>
        @endif
    </main>
@endsection