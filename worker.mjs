const DEFAULT_PI_PROXY_URL = 'https://pi-proxy.studtok.com/study-bundle';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4.1-mini';
const DEFAULT_PASSCODE = 'differentdimension';
const MAX_PDF_TEXT_LENGTH = 9000;
const DEFAULT_IMPORTANT_DATES_CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSXYC-ZQPMy3ViRMeLZXHDIkOJx1e6dfVmqWyWkCtWWBuhD06XFycAhdjIKIVA7_L-REJh-qKL1qnS4/pub?gid=1977665068&single=true&output=csv';

function json(payload, init = {}) {
    const headers = new Headers(init.headers || {});
    headers.set('Content-Type', 'application/json; charset=utf-8');
    return new Response(JSON.stringify(payload), {
        ...init,
        headers,
    });
}

function withCorsHeaders(response, origin = '*') {
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Passcode');
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

function getAllowedOrigin(env) {
    return typeof env.ALLOW_ORIGIN === 'string' && env.ALLOW_ORIGIN.trim() ? env.ALLOW_ORIGIN.trim() : '*';
}

function getPiProxyUrl(env) {
    return typeof env.PI_PROXY_URL === 'string' && env.PI_PROXY_URL.trim() ? env.PI_PROXY_URL.trim() : DEFAULT_PI_PROXY_URL;
}

function getImportantDatesCsvUrl(env) {
    return typeof env.IMPORTANT_DATES_CSV_URL === 'string' && env.IMPORTANT_DATES_CSV_URL.trim()
        ? env.IMPORTANT_DATES_CSV_URL.trim()
        : DEFAULT_IMPORTANT_DATES_CSV_URL;
}

function normalisePlan(plan) {
    const source = plan && typeof plan === 'object' ? plan : {};
    const flashcardCount = Number(source.flashcardCount ?? 25);
    const quizCount = Number(source.quizCount ?? 0);

    return {
        includeFlashcards: Boolean(source.includeFlashcards),
        flashcardCount: Number.isFinite(flashcardCount) && flashcardCount > 0 ? Math.min(Math.round(flashcardCount), 50) : 25,
        includeQuiz: Boolean(source.includeQuiz),
        quizCount: Number.isFinite(quizCount) && quizCount > 0 ? Math.min(Math.round(quizCount), 30) : 0,
        note: typeof source.note === 'string' ? source.note.trim().slice(0, 300) : '',
    };
}

function buildPrompt(pdfText, plan) {
    const instructionParts = [];

    if (plan.includeFlashcards) {
        instructionParts.push(
            `From the provided study material, create ${plan.flashcardCount} question-answer flashcards. Keep them focused on key ideas and easy to revise from.`
        );
    } else {
        instructionParts.push('Do not create flashcards. Return an empty "flashcards" array.');
    }

    if (plan.includeQuiz) {
        instructionParts.push(
            `Create ${plan.quizCount} multiple-choice quiz questions with exactly four answer options each. Make them medium or hard difficulty, use plausible distractors, and return the correct answer as correctOption using one of the letters A, B, C, or D. Include a short one-sentence explanation for every question.`
        );
    } else {
        instructionParts.push('Do not create quiz questions. Return an empty "quizQuestions" array.');
    }

    if (plan.note) {
        instructionParts.push(`Additional learner note: ${plan.note}.`);
    }

    instructionParts.push('Write every field in Lithuanian and return only a valid JSON object.');

    return [
        {
            role: 'system',
            content:
                'You are a study coach that replies with one compact JSON object only. Always return two top-level fields: "flashcards" and "quizQuestions". "flashcards" is an array of objects with "question", "answer", and optional "tags". "quizQuestions" is an array of objects with "question", "options" (exactly four strings), "correctOption" (A, B, C, or D), and "explanation". If a section is not requested, return an empty array for it. Do not use Markdown.',
        },
        {
            role: 'user',
            content: `${instructionParts.join(' ')}\n\n${pdfText}`,
        },
    ];
}

function parseStudyBundle(rawContent) {
    if (!rawContent) {
        return {
            flashcards: [],
            quizQuestions: [],
        };
    }

    const cleaned = String(rawContent).replace(/```json|```/gi, '').trim();
    let parsed;

    try {
        parsed = JSON.parse(cleaned);
    } catch (error) {
        return {
            flashcards: [],
            quizQuestions: [],
        };
    }

    const flashcardItems = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.flashcards)
        ? parsed.flashcards
        : [];
    const flashcards = flashcardItems
        .map((item) => ({
            question: String(item.question || '').trim(),
            answer: String(item.answer || '').trim(),
            tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
        }))
        .filter((card) => card.question && card.answer);

    const quizItems = Array.isArray(parsed.quizQuestions)
        ? parsed.quizQuestions
        : Array.isArray(parsed.quiz)
        ? parsed.quiz
        : [];
    const quizQuestions = quizItems
        .map((item) => {
            const question = String(item.question || '').trim();
            const options = Array.isArray(item.options)
                ? item.options.map((option) => String(option || '').trim()).filter(Boolean)
                : [];
            let correctIndex = -1;

            if (typeof item.correctOption === 'string') {
                const letter = item.correctOption.trim().toUpperCase();
                if ('ABCD'.includes(letter)) {
                    correctIndex = 'ABCD'.indexOf(letter);
                }
            } else if (Number.isInteger(item.correctIndex) && item.correctIndex >= 0 && item.correctIndex < 4) {
                correctIndex = item.correctIndex;
            }

            const explanation = typeof item.explanation === 'string' ? item.explanation.trim() : '';
            if (!question || options.length !== 4 || correctIndex < 0 || correctIndex > 3) {
                return null;
            }

            return {
                question,
                options,
                correctIndex,
                explanation,
            };
        })
        .filter(Boolean);

    return {
        flashcards,
        quizQuestions,
    };
}

async function handleStudyBundle(request, env) {
    if (request.method === 'OPTIONS') {
        return withCorsHeaders(new Response(null, { status: 204 }), getAllowedOrigin(env));
    }

    if (request.method !== 'POST') {
        return withCorsHeaders(json({ error: 'Method Not Allowed' }, { status: 405 }), getAllowedOrigin(env));
    }

    const expectedPasscode =
        typeof env.STUDTOK_PASSCODE === 'string' && env.STUDTOK_PASSCODE.trim()
            ? env.STUDTOK_PASSCODE.trim()
            : DEFAULT_PASSCODE;
    const providedPasscode = String(request.headers.get('X-Passcode') || '').trim();
    if (!providedPasscode || providedPasscode !== expectedPasscode) {
        return withCorsHeaders(json({ error: 'Unauthorized' }, { status: 401 }), getAllowedOrigin(env));
    }

    let body;
    try {
        body = await request.json();
    } catch (error) {
        return withCorsHeaders(json({ error: 'Invalid JSON body.' }, { status: 400 }), getAllowedOrigin(env));
    }

    const pdfText = typeof body?.pdf_text === 'string' ? body.pdf_text.trim().slice(0, MAX_PDF_TEXT_LENGTH) : '';
    if (!pdfText) {
        return withCorsHeaders(json({ error: 'Missing pdf_text.' }, { status: 400 }), getAllowedOrigin(env));
    }

    const piProxyUrl = getPiProxyUrl(env);
    if (piProxyUrl) {
        const proxyPasscode =
            typeof env.PI_PROXY_PASSCODE === 'string' && env.PI_PROXY_PASSCODE.trim()
                ? env.PI_PROXY_PASSCODE.trim()
                : expectedPasscode;
        const proxyPayload = {
            ...body,
            pdf_text: pdfText,
            plan: body?.plan && typeof body.plan === 'object' ? body.plan : {},
        };

        try {
            const proxyResponse = await fetch(piProxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Passcode': proxyPasscode,
                },
                body: JSON.stringify(proxyPayload),
            });
            const proxyText = await proxyResponse.text();
            const contentType = proxyResponse.headers.get('content-type') || 'application/json; charset=utf-8';
            return withCorsHeaders(
                new Response(proxyText, {
                    status: proxyResponse.status,
                    statusText: proxyResponse.statusText,
                    headers: {
                        'Content-Type': contentType,
                    },
                }),
                getAllowedOrigin(env)
            );
        } catch (error) {
            return withCorsHeaders(
                json(
                    {
                        error: `Pi proxy request failed at ${piProxyUrl}. ${error instanceof Error ? error.message : 'Unknown error.'}`,
                    },
                    { status: 502 }
                ),
                getAllowedOrigin(env)
            );
        }
    }

    if (!env.OPENAI_API_KEY) {
        return withCorsHeaders(
            json({ error: 'Missing PI_PROXY_URL target or OPENAI_API_KEY secret in Cloudflare Worker.' }, { status: 500 }),
            getAllowedOrigin(env)
        );
    }

    const plan = normalisePlan(body.plan);
    const openAiResponse = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: env.OPENAI_MODEL || OPENAI_MODEL,
            temperature: 0.5,
            messages: buildPrompt(pdfText, plan),
        }),
    });

    const payload = await openAiResponse.json().catch(() => null);
    if (!openAiResponse.ok) {
        const details = payload?.error?.message || 'OpenAI request failed.';
        return withCorsHeaders(json({ error: details }, { status: openAiResponse.status }), getAllowedOrigin(env));
    }

    const rawContent = payload?.choices?.[0]?.message?.content?.trim() || '';
    return withCorsHeaders(json(parseStudyBundle(rawContent), { status: 200 }), getAllowedOrigin(env));
}

async function handleImportantDates(request, env) {
    if (request.method === 'OPTIONS') {
        return withCorsHeaders(new Response(null, { status: 204 }), getAllowedOrigin(env));
    }

    if (request.method !== 'GET') {
        return withCorsHeaders(json({ error: 'Method Not Allowed' }, { status: 405 }), getAllowedOrigin(env));
    }

    const targetUrl = getImportantDatesCsvUrl(env);
    try {
        const upstreamResponse = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                Accept: 'text/csv,text/plain;q=0.9,*/*;q=0.8',
            },
        });

        if (!upstreamResponse.ok) {
            return withCorsHeaders(
                json({ error: `Svarbių datų šaltinis nepasiekiamas (${upstreamResponse.status}).` }, { status: 502 }),
                getAllowedOrigin(env)
            );
        }

        const csvText = await upstreamResponse.text();
        return withCorsHeaders(
            new Response(csvText, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Cache-Control': 'no-store',
                },
            }),
            getAllowedOrigin(env)
        );
    } catch (error) {
        return withCorsHeaders(
            json(
                {
                    error: `Nepavyko gauti svarbių datų iš Google Sheets. ${error instanceof Error ? error.message : 'Unknown error.'}`,
                },
                { status: 502 }
            ),
            getAllowedOrigin(env)
        );
    }
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/api/study-bundle' || url.pathname === '/study-bundle') {
            return handleStudyBundle(request, env);
        }

        if (url.pathname === '/api/important-dates' || url.pathname === '/important-dates') {
            return handleImportantDates(request, env);
        }

        return new Response('Not Found', { status: 404 });
    },
};
