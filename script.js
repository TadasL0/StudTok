'use strict';

const screens = document.querySelectorAll('.screen');
const nameInput = document.getElementById('name-input');
const introForm = document.getElementById('intro-form');

const flashcardForm = document.getElementById('flashcard-form');
const pdfInput = document.getElementById('pdf-input');
const pdfTrigger = document.getElementById('pdf-trigger');
const pdfFileName = document.getElementById('pdf-file-name');
const flashcardStatus = document.getElementById('flashcard-status');
const flashcardWidget = document.getElementById('flashcard-widget');
const flashcardCard = document.getElementById('flashcard-card');
const flashcardFront = document.getElementById('flashcard-front');
const flashcardBack = document.getElementById('flashcard-back');
const flashcardPrevBtn = document.getElementById('flashcard-prev');
const flashcardNextBtn = document.getElementById('flashcard-next');
const flashcardCounter = document.getElementById('flashcard-counter');
const flashcardTags = document.getElementById('flashcard-tags');
const generateFlashcardsBtn = document.getElementById('generate-flashcards');
const flashcardLengthInputs = document.querySelectorAll('input[name="flashcard-length"]');
const generateFlashcardsToggle = document.getElementById('mode-flashcards');
const generateQuizToggle = document.getElementById('mode-quiz');
const quizLengthField = document.getElementById('quiz-length-field');
const quizLengthInputs = document.querySelectorAll('input[name="quiz-length"]');
const regenerateFlashcardsBtn = document.getElementById('flashcard-regenerate');
const regenerateQuizBtn = document.getElementById('quiz-regenerate');
const shuffleQuizBtn = document.getElementById('quiz-shuffle');

const weekIndicator = document.querySelector('.week-indicator');
const weekIndicatorValue = document.getElementById('week-indicator-value');
const weekIndicatorRange = document.getElementById('week-indicator-range');

const quizWidget = document.getElementById('quiz-widget');
const quizEmpty = document.getElementById('quiz-empty');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const quizProgress = document.getElementById('quiz-progress');
const quizFeedback = document.getElementById('quiz-feedback');
const quizNextButton = document.getElementById('quiz-next');
const quizRestartButton = document.getElementById('quiz-restart');
const quizEmptyDefaultText = quizEmpty?.textContent || '';
const quizNotSelectedText = 'Testas nebuvo pasirinktas. Pa\u017Eym\u0117k "ABCD test\u0105", jei jo reikia.';

const pdfFileNameEmptyText = pdfFileName?.dataset?.empty || 'Failas nepasirinktas';

const state = {
    name: 'Emilija',
    apiKey: '',
    notepadPrompt: '',
};

const flashcardState = {
    cards: [],
    index: 0,
    flipped: false,
};

const quizState = {
    baseQuestions: [],
    questions: [],
    index: 0,
    score: 0,
    answered: false,
};

const generationState = {
    pdfText: '',
    lastPlan: null,
    lastFileName: '',
    modeTouched: false,
};

let generationBusy = false;

function updatePdfSelectionLabel(file) {
    if (!pdfFileName) return;
    if (file) {
        pdfFileName.textContent = file.name;
        pdfFileName.classList.add('flashcard-form__file-name--has-file');
    } else {
        pdfFileName.textContent = pdfFileNameEmptyText;
        pdfFileName.classList.remove('flashcard-form__file-name--has-file');
    }
}

function updateGenerationModeStyles() {
    [generateFlashcardsToggle, generateQuizToggle].forEach((input) => {
        if (!input) return;
        const wrapper = input.closest('.flashcard-form__toggle');
        if (!wrapper) return;
        wrapper.classList.toggle('flashcard-form__toggle--active', Boolean(input.checked));
        const shouldMute = !input.checked && Boolean(generationState.modeTouched);
        wrapper.classList.toggle('flashcard-form__toggle--muted', shouldMute);
    });
    updateGenerateButtonText();
}

function updateGenerateButtonText() {
    if (!generateFlashcardsBtn) return;
    const quizActive = Boolean(generateQuizToggle?.checked) && !Boolean(generateFlashcardsToggle?.checked);
    generateFlashcardsBtn.textContent = quizActive ? 'Sukurti test\u0105' : 'Sukurti korteles';
}

function updateQuizPlaceholderOnMode() {
    if (!quizEmpty) return;
    if (generateQuizToggle?.checked) {
        quizEmpty.textContent = quizEmptyDefaultText;
    } else {
        quizEmpty.textContent = quizNotSelectedText;
    }
}

function handleGenerationToggleChange(changed, counterpart) {
    if (!changed) return;
    if (changed.checked) {
        if (counterpart) counterpart.checked = false;
    } else if (counterpart && !counterpart.checked) {
        changed.checked = true;
    }
    updateGenerationModeStyles();
    updateQuizPlaceholderOnMode();
    updateQuizLengthVisibility();
}

function ensureQuizLengthDefault() {
    if (!quizLengthInputs || typeof quizLengthInputs.length !== 'number' || quizLengthInputs.length === 0) {
        return;
    }
    const inputs = Array.from(quizLengthInputs);
    const anyChecked = inputs.some((input) => input.checked);
    if (!anyChecked) {
        const fallback = inputs.find((input) => input.dataset?.default === 'true') || inputs[0];
        if (fallback) {
            fallback.checked = true;
        }
    }
}

function updateQuizLengthVisibility() {
    const active = Boolean(generateQuizToggle?.checked);
    if (quizLengthField) {
        quizLengthField.hidden = !active;
        if (active) {
            quizLengthField.removeAttribute('aria-hidden');
        } else {
            quizLengthField.setAttribute('aria-hidden', 'true');
        }
    }
    quizLengthInputs.forEach((input) => {
        input.disabled = !active;
    });
    if (active) {
        ensureQuizLengthDefault();
    }
}

function updateRegenerateButtonsAvailability() {
    const hasStoredText = Boolean(generationState.pdfText);
    const hasApiKey = Boolean(state.apiKey);
    if (regenerateFlashcardsBtn) {
        const hasCards = flashcardState.cards.length > 0;
        regenerateFlashcardsBtn.disabled = generationBusy || !hasStoredText || !hasApiKey || !hasCards;
    }
    if (regenerateQuizBtn) {
        const hasQuestions = quizState.questions.length > 0;
        regenerateQuizBtn.disabled = generationBusy || !hasStoredText || !hasApiKey || !hasQuestions;
    }
    if (shuffleQuizBtn) {
        const canShuffle = quizState.baseQuestions.length > 1;
        shuffleQuizBtn.disabled = generationBusy || !canShuffle;
    }
}

function setGenerationBusy(isBusy) {
    generationBusy = Boolean(isBusy);
    if (flashcardForm) {
        if (generationBusy) {
            flashcardForm.setAttribute('aria-busy', 'true');
        } else {
            flashcardForm.removeAttribute('aria-busy');
        }
    }
    if (generateFlashcardsBtn) {
        generateFlashcardsBtn.disabled = generationBusy;
    }
    updateRegenerateButtonsAvailability();
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const WEEK_LENGTH_DAYS = 7;
const WEEK_ROTATION_LENGTH = 2;
let weekIndicatorTimeoutId = null;

function startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function getWeekStart(date) {
    const reference = new Date(date);
    const day = reference.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    reference.setDate(reference.getDate() + diff);
    reference.setHours(0, 0, 0, 0);
    return reference;
}

function getCurrentSemesterStart(date) {
    const year = date.getFullYear();
    const febStart = new Date(year, 1, 1);
    const septStart = new Date(year, 8, 1);
    febStart.setHours(0, 0, 0, 0);
    septStart.setHours(0, 0, 0, 0);
    if (date >= septStart) {
        return septStart;
    }
    if (date >= febStart) {
        return febStart;
    }
    const prevSept = new Date(year - 1, 8, 1);
    prevSept.setHours(0, 0, 0, 0);
    return prevSept;
}

function getWeekRotationIndex(date) {
    const semesterStart = getCurrentSemesterStart(date);
    const elapsedDays = Math.floor((startOfDay(date) - semesterStart) / MS_PER_DAY);
    const fullWeeksSinceStart = Math.floor(elapsedDays / WEEK_LENGTH_DAYS);
    const rotationIndex = ((fullWeeksSinceStart % WEEK_ROTATION_LENGTH) + WEEK_ROTATION_LENGTH) % WEEK_ROTATION_LENGTH;
    return rotationIndex;
}

function formatMonthDay(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return month + '-' + day;
}

function updateWeekIndicator(now = new Date()) {
    if (!weekIndicatorValue) {
        return;
    }
    const rotationIndex = getWeekRotationIndex(now);
    const weekNumber = rotationIndex + 1;
    weekIndicatorValue.textContent = weekNumber + ' savait\u0117';

    if (weekIndicatorRange) {
        const weekStart = getWeekStart(now);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + WEEK_LENGTH_DAYS - 1);
        weekIndicatorRange.textContent = formatMonthDay(weekStart) + ' \u2013 ' + formatMonthDay(weekEnd);
    }
    if (weekIndicator) {
        weekIndicator.hidden = false;
        weekIndicator.dataset.week = String(weekNumber);
    }
}

function scheduleWeekIndicatorUpdate() {
    if (!weekIndicatorValue) {
        return;
    }
    if (weekIndicatorTimeoutId) {
        clearTimeout(weekIndicatorTimeoutId);
    }
    const now = new Date();
    const nextUpdate = new Date(now);
    nextUpdate.setHours(0, 0, 0, 0);
    nextUpdate.setDate(nextUpdate.getDate() + 1);
    let delay = nextUpdate.getTime() - now.getTime();
    if (delay < 0) {
        delay = 0;
    }
    weekIndicatorTimeoutId = setTimeout(() => {
        updateWeekIndicator();
        scheduleWeekIndicatorUpdate();
    }, Math.max(delay + 1000, 1000));
}

function setWeekIndicatorCollapsed(collapsed) {
    if (!weekIndicator) {
        return;
    }
    weekIndicator.classList.toggle('week-indicator--collapsed', collapsed);
    document.body.classList.toggle('week-indicator-collapsed', collapsed);
    weekIndicator.setAttribute('aria-expanded', String(!collapsed));
}

function toggleWeekIndicatorCollapsed() {
    if (!weekIndicator) {
        return;
    }
    const collapsed = !weekIndicator.classList.contains('week-indicator--collapsed');
    setWeekIndicatorCollapsed(collapsed);
}

const introApiKeyInput = document.getElementById('intro-api-key');
const introToggleKeyBtn = document.getElementById('intro-toggle-key');
const introRememberKeyCheckbox = document.getElementById('intro-remember-key');
const editSetupBtn = document.getElementById('edit-setup');

const splash = document.querySelector('.welcome-splash');
const splashName = document.getElementById('splash-name');
const splashRunner = document.querySelector('.welcome-splash__runner');

const SPLASH_RUNNER_FRAMES = [
    'assets/emilija1.png',
    'assets/emilija2.png',
    'assets/emilija3.png',
];

if (splashRunner) {
    SPLASH_RUNNER_FRAMES.forEach((src) => {
        const img = new Image();
        img.src = src;
    });
}

if (pdfTrigger && pdfInput) {
    pdfTrigger.addEventListener('click', () => {
        pdfInput.click();
    });
}

pdfInput?.addEventListener('change', () => {
    const file = pdfInput.files && pdfInput.files[0];
    updatePdfSelectionLabel(file || null);
    generationState.pdfText = '';
    generationState.lastPlan = null;
    generationState.lastFileName = file ? file.name : '';
    updateRegenerateButtonsAvailability();
});

updatePdfSelectionLabel(pdfInput?.files && pdfInput.files[0]);
handleGenerationToggleChange(generateFlashcardsToggle, generateQuizToggle);
generateFlashcardsToggle?.addEventListener('change', () => {
    generationState.modeTouched = true;
    handleGenerationToggleChange(generateFlashcardsToggle, generateQuizToggle);
});
generateQuizToggle?.addEventListener('change', () => {
    generationState.modeTouched = true;
    handleGenerationToggleChange(generateQuizToggle, generateFlashcardsToggle);
});

const notepadForm = document.getElementById('notepad-form');
const notepadInput = document.getElementById('notepad-input');
const notepadList = document.getElementById('notepad-list');
const notepadEmpty = document.querySelector('.notepad-empty');

const stickyBoard = document.getElementById('sticky-board');
const stickyEmpty = document.getElementById('sticky-empty');
const clearStickiesBtn = document.getElementById('clear-stickies');

const FLASHCARD_STORAGE_KEY = 'pinkStudy.apiKey';
const STICKY_STORAGE_KEY = 'pinkStudy.stickies';
const FLASHCARD_MODEL = 'gpt-4.1-mini';
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MAX_PDF_CHARACTERS = 9000;
const MAX_PDF_SIZE = 8 * 1024 * 1024; // 8 MB

const NOTEPAD_PROMPTS = [

    { text: 'Pasiruo\u0161ti med\u017eiag\u0173 mokslui', weight: 3 },

    { text: 'Pasiruo\u0161ti matematikai', weight: 3 },

    { text: 'Pasiruo\u0161ti brai\u017eybai', weight: 3 },

    { text: 'Pasiruo\u0161ti med\u017eiag\u0173 mechanikai', weight: 3 },

    { text: 'Atsipalaiduoti ir par\u016Bkyti', weight: 1 },

    { text: 'Palepinti save \u0161okoladu', weight: 1 },

];



const STICKY_PALETTES = [
    {
        bg1: 'rgba(255, 250, 230, 0.96)',
        bg2: 'rgba(255, 212, 232, 0.92)',
        pinStrong: 'rgba(255, 138, 196, 0.95)',
        pinSoft: 'rgba(255, 170, 215, 0.5)',
        text: '#44263f',
    },
    {
        bg1: 'rgba(255, 248, 252, 0.96)',
        bg2: 'rgba(255, 228, 242, 0.92)',
        pinStrong: 'rgba(255, 183, 219, 0.95)',
        pinSoft: 'rgba(255, 183, 219, 0.45)',
        text: '#3f2b35',
    },
    {
        bg1: 'rgba(255, 245, 240, 0.95)',
        bg2: 'rgba(255, 219, 170, 0.92)',
        pinStrong: 'rgba(255, 185, 120, 0.95)',
        pinSoft: 'rgba(255, 185, 120, 0.5)',
        text: '#3f2b20',
    },
    {
        bg1: 'rgba(255, 240, 247, 0.95)',
        bg2: 'rgba(255, 220, 239, 0.92)',
        pinStrong: 'rgba(255, 170, 215, 0.95)',
        pinSoft: 'rgba(255, 170, 215, 0.45)',
        text: '#3f2d3c',
    },
    {
        bg1: 'rgba(255, 247, 240, 0.95)',
        bg2: 'rgba(255, 226, 214, 0.92)',
        pinStrong: 'rgba(255, 190, 160, 0.95)',
        pinSoft: 'rgba(255, 190, 160, 0.5)',
        text: '#3f3025',
    },
];

let audioContext;
let stickyNotesState = [];
let splashTimeout;

function showScreen(id) {
    screens.forEach((screen) => {
        screen.classList.toggle('screen--active', screen.dataset.screen === id);
    });
}

function updateGreetingNames() {
    if (splashName) {
        splashName.textContent = `${state.name}!`;
    }
}

function setFlashcardStatus(message, mood = 'info') {
    if (!flashcardStatus) return;
    flashcardStatus.textContent = message;
    flashcardStatus.classList.remove('flashcard-status--error', 'flashcard-status--success', 'flashcard-status--pending');
    if (mood === 'error') {
        flashcardStatus.classList.add('flashcard-status--error');
    } else if (mood === 'success') {
        flashcardStatus.classList.add('flashcard-status--success');
    } else if (mood === 'pending') {
        flashcardStatus.classList.add('flashcard-status--pending');
    }
}

function scheduleSplashHide(delay = 1950) {
    if (!splash) return;
    clearTimeout(splashTimeout);
    splashTimeout = setTimeout(() => {
        if (splashRunner) {
            splashRunner.classList.add('welcome-splash__runner--jump');
        }
        setTimeout(() => {
            splash.classList.add('welcome-splash--hide');
            setTimeout(() => {
                splash?.remove();
            }, 800);
        }, 200);
    }, delay);
}



async function extractTextFromPdf(file) {
    if (!window.pdfjsLib) {
        throw new Error('Nepavyko \u012fkelti PDF pagalbin\u0117s bibliotekos. Patikrink ry\u0161\u012f ir \u012fkelk puslap\u012f i\u0161 naujo.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let gathered = '';

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(' ');
        gathered += `\n\nPage ${pageNumber}:\n${pageText}`;
        if (gathered.length >= MAX_PDF_CHARACTERS) {
            gathered = gathered.slice(0, MAX_PDF_CHARACTERS);
            break;
        }
    }

    return gathered.trim();
}

async function fetchStudyBundleFromApi(text, apiKey, generationPlan) {
    const plan = generationPlan && typeof generationPlan === 'object' ? generationPlan : {};
    const {
        includeFlashcards = true,
        flashcardCount = 25,
        includeQuiz = false,
        quizCount = 0,
    } = plan;
    const instructionParts = [];

    if (includeFlashcards) {
        instructionParts.push(
            `I\u0161 pateiktos mokomosios med\u017Eiagos paruo\u0161k ${flashcardCount} klausim\u0173-atsakym\u0173 korteles. Koncentruokis \u012F esm\u0119 ir pateik draugi\u0161kus klausimus bei atsakymus.`
        );
    } else {
        instructionParts.push(
            'I\u0161 pateiktos mokomosios med\u017Eiagos korteli\u0173 neformuok - laukas "flashcards" turi b\u016Bti tu\u0161\u010Dias masyv\u0105.'
        );
    }

    if (includeQuiz) {
        instructionParts.push(
            `Sudaryk ${quizCount} testinius klausimus, kuri\u0173 kiekvienas turi keturis atsakymo variantus. Variantus pateik lauke "options" (be raid\u017Ei\u0173), o teising\u0105 raid\u0119 (A, B, C arba D) \u012Fra\u0161yk lauke "correctOption". Jei gali, prid\u0117k trump\u0105 paai\u0161kinim\u0105 lauke "explanation".`
        );
    } else {
        instructionParts.push(
            'ABCD testo \u0161\u012Fkart neformuok - laukas "quizQuestions" turi b\u016Bti tu\u0161\u010Dias masyvas.'
        );
    }

    instructionParts.push('Visus laukus ra\u0161yk lietuvi\u0161kai ir gr\u0105\u017Eink tik valid\u0173 JSON objekt\u0105.');

    const prompt = [
        {
            role: 'system',
            content:
                'Tu esi nuotaikinga mokymosi trener\u0117, kuri atsako tik kompakti\u0161k\u0105 JSON objekt\u0105. Visada gr\u0105\u017Eink du laukus: "flashcards" ir "quizQuestions". "flashcards" yra masyvas su objektais, turin\u010Diais "question", "answer" ir neprivalom\u0105 "tags" masyv\u0105. "quizQuestions" yra masyvas su objektais, turin\u010Diais "question", "options" (keturi \u012Fra\u0161ai) ir "correctOption" (raid\u0117 A, B, C arba D). Galima prid\u0117ti neprivalom\u0105 "explanation". Jei kurio nors turinio nereikia, atitinkam\u0105 masyv\u0105 palik tu\u0161\u010Di\u0105. Visk\u0105 ra\u0161yk lietuvi\u0161kai, be Markdown.',
        },
        {
            role: 'user',
            content: `${instructionParts.join(' ')}\n\n${text}`,
        },
    ];

    const response = await fetch(OPENAI_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: FLASHCARD_MODEL,
            temperature: 0.5,
            messages: prompt,
        }),
    });

    if (!response.ok) {
        let details = '';
        try {
            const errorPayload = await response.json();
            details = errorPayload?.error?.message || '';
        } catch (error) {
            details = '';
        }
        const message = details ? `${response.status} error: ${details}` : `API request failed with status ${response.status}`;
        throw new Error(message);
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content?.trim();
    return parseStudyBundle(rawContent);
}

function parseStudyBundle(rawContent) {
    if (!rawContent) {
        return {
            flashcards: [],
            quizQuestions: [],
        };
    }
    const cleaned = rawContent.replace(/```json|```/gi, '').trim();
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
            tags: Array.isArray(item.tags)
                ? item.tags.map((tag) => String(tag).trim()).filter(Boolean)
                : [],
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
            if (Number.isInteger(item.correctIndex) && item.correctIndex >= 0 && item.correctIndex < options.length) {
                correctIndex = item.correctIndex;
            } else if (typeof item.correctOption === 'string') {
                const letter = item.correctOption.trim().toUpperCase();
                const index = 'ABCD'.indexOf(letter);
                if (index >= 0) {
                    correctIndex = index;
                }
            } else if (typeof item.answer === 'string') {
                const answerText = item.answer.trim();
                const letterGuess = answerText.toUpperCase();
                const letterIndex = 'ABCD'.indexOf(letterGuess);
                if (letterIndex >= 0) {
                    correctIndex = letterIndex;
                } else {
                    const optionIndex = options.findIndex((option) => option.toLowerCase() === answerText.toLowerCase());
                    if (optionIndex >= 0) {
                        correctIndex = optionIndex;
                    }
                }
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

function renderFlashcard() {
    if (
        !flashcardWidget ||
        !flashcardCard ||
        !flashcardFront ||
        !flashcardBack ||
        !flashcardCounter ||
        !flashcardTags
    ) {
        return;
    }

    if (flashcardState.cards.length === 0) {
        flashcardWidget.hidden = true;
        return;
    }

    const total = flashcardState.cards.length;
    const current = flashcardState.cards[flashcardState.index];

    flashcardWidget.hidden = false;
    flashcardCard.dataset.flipped = flashcardState.flipped ? 'true' : 'false';
    flashcardFront.textContent = current.question;
    flashcardBack.textContent = current.answer;
    flashcardCounter.textContent = `${flashcardState.index + 1} / ${total}`;

    flashcardTags.innerHTML = '';
    if (current.tags.length > 0) {
        current.tags.forEach((tag) => {
            const chip = document.createElement('span');
            chip.className = 'flashcard-widget__tag';
            chip.textContent = tag;
            flashcardTags.appendChild(chip);
        });
    }

    const disableNav = total <= 1;
    flashcardPrevBtn.disabled = disableNav;
    flashcardNextBtn.disabled = disableNav;
}

function showFlashcardByIndex(index) {
    const total = flashcardState.cards.length;
    if (total === 0) return;

    const wrappedIndex = (index + total) % total;
    flashcardState.index = wrappedIndex;
    flashcardState.flipped = false;
    renderFlashcard();
    if (flashcardCard) {
        flashcardCard.focus({ preventScroll: true });
    }
}

function toggleFlashcardFace() {
    flashcardState.flipped = !flashcardState.flipped;
    if (flashcardCard) {
        flashcardCard.dataset.flipped = flashcardState.flipped ? 'true' : 'false';
    }
}

function loadStoredApiKey() {
    try {
        const stored = localStorage.getItem(FLASHCARD_STORAGE_KEY);
        if (stored) {
            state.apiKey = stored;
            if (introApiKeyInput) {
                introApiKeyInput.value = stored;
            }
            if (introRememberKeyCheckbox) {
                introRememberKeyCheckbox.checked = true;
            }
        }
    } catch (error) {
        // Storage may be disabled; ignore politely.
    }
}

function persistApiKey(value, shouldRemember) {
    try {
        if (shouldRemember && value) {
            localStorage.setItem(FLASHCARD_STORAGE_KEY, value);
        } else {
            localStorage.removeItem(FLASHCARD_STORAGE_KEY);
        }
    } catch (error) {
        // Best effort only.
    }
}

function loadStoredStickies() {
    try {
        const stored = localStorage.getItem(STICKY_STORAGE_KEY);
        if (!stored) {
            stickyNotesState = [];
            return;
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            stickyNotesState = [];
            return;
        }

        const sanitised = parsed
            .map((item) => {
                const textValue = typeof item?.text === 'string' ? item.text.trim() : '';
                const idValue = typeof item?.id === 'string' ? item.id.trim() : '';
                const paletteIdx =
                    Number.isInteger(item?.paletteIndex) && STICKY_PALETTES[item.paletteIndex]
                        ? item.paletteIndex
                        : 0;
                const tiltValue = item?.tilt === 'left' ? 'left' : 'right';
                if (!textValue || !idValue) return null;
                return {
                    id: idValue,
                    text: textValue,
                    paletteIndex: paletteIdx,
                    tilt: tiltValue,
                };
            })
            .filter(Boolean);

        stickyNotesState = sanitised;
        sanitised
            .slice()
            .reverse()
            .forEach((item) => {
                createStickyNote(item.text, {
                    paletteIndex: item.paletteIndex,
                    tilt: item.tilt,
                    id: item.id,
                    skipPersist: true,
                });
            });
    } catch (error) {
        stickyNotesState = [];
    }
}

function pickWeightedNotepadPrompt() {
    const totalWeight = NOTEPAD_PROMPTS.reduce((sum, prompt) => sum + prompt.weight, 0);
    let ticket = Math.random() * totalWeight;
    for (const prompt of NOTEPAD_PROMPTS) {
        ticket -= prompt.weight;
        if (ticket <= 0) {
            return prompt.text;
        }
    }
    return NOTEPAD_PROMPTS[0]?.text || '';
}

function ensureNotepadPlaceholder(force = false) {
    if (!notepadInput) return;
    if (!state.notepadPrompt) {
        state.notepadPrompt = pickWeightedNotepadPrompt();
    }
    if (force || notepadInput.value.trim() === '') {
        notepadInput.placeholder = state.notepadPrompt;
    }
}

function clearFlashcardWidget() {
    flashcardState.cards = [];
    flashcardState.index = 0;
    flashcardState.flipped = false;
    if (flashcardWidget) {
        flashcardWidget.hidden = true;
    }
    if (flashcardFront) flashcardFront.textContent = '';
    if (flashcardBack) flashcardBack.textContent = '';
    if (flashcardCounter) flashcardCounter.textContent = '0 / 0';
    if (flashcardTags) flashcardTags.innerHTML = '';
    if (flashcardCard) flashcardCard.dataset.flipped = 'false';
    updateRegenerateButtonsAvailability();
}

function clearQuizWidget() {
    quizState.baseQuestions = [];
    quizState.questions = [];
    quizState.index = 0;
    quizState.score = 0;
    quizState.answered = false;
    if (quizWidget) {
        quizWidget.hidden = true;
    }
    if (quizEmpty) {
        quizEmpty.hidden = false;
        quizEmpty.textContent = quizEmptyDefaultText;
    }
    if (quizQuestion) {
        quizQuestion.textContent = '';
    }
    if (quizOptions) {
        quizOptions.innerHTML = '';
    }
    if (quizProgress) {
        quizProgress.textContent = '0 / 0';
    }
    if (quizFeedback) {
        quizFeedback.textContent = '';
    }
    if (quizNextButton) {
        quizNextButton.disabled = true;
        quizNextButton.textContent = 'Kitas klausimas';
    }
    if (quizRestartButton) {
        quizRestartButton.disabled = true;
    }
    updateQuizPlaceholderOnMode();
    updateRegenerateButtonsAvailability();
}

function getSelectedFlashcardPreferences() {
    const defaultFlashcardCount = 25;
    const defaultQuizCount = 20;
    let selectedFlashcardInput = null;

    flashcardLengthInputs.forEach((input) => {
        if (input.checked) {
            selectedFlashcardInput = input;
        }
    });

    const parsedFlashcardValue = selectedFlashcardInput ? parseInt(selectedFlashcardInput.value, 10) : Number.NaN;
    const flashcardCount = Number.isFinite(parsedFlashcardValue) && parsedFlashcardValue > 0 ? parsedFlashcardValue : defaultFlashcardCount;

    let selectedQuizInput = null;
    quizLengthInputs.forEach((input) => {
        if (input.checked) {
            selectedQuizInput = input;
        }
    });
    const parsedQuizValue = selectedQuizInput ? parseInt(selectedQuizInput.value, 10) : Number.NaN;
    const quizPreference = Number.isFinite(parsedQuizValue) && parsedQuizValue > 0 ? parsedQuizValue : defaultQuizCount;

    const includeFlashcards = generateFlashcardsToggle ? generateFlashcardsToggle.checked : true;
    const includeQuiz = generateQuizToggle ? generateQuizToggle.checked : false;

    return {
        includeFlashcards,
        flashcardCount,
        includeQuiz,
        quizCount: includeQuiz ? Math.max(3, quizPreference) : 0,
    };
}

function shuffleArray(items) {
    const array = Array.isArray(items) ? items.slice() : [];
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function prepareBaseQuizQuestions(questions) {
    return questions
        .map((item) => {
            if (!item) return null;
            const options = Array.isArray(item.options) ? item.options.slice() : [];
            if (typeof item.question !== 'string' || options.length !== 4) {
                return null;
            }
            const correctIndex = Number.isInteger(item.correctIndex) ? item.correctIndex : -1;
            if (correctIndex < 0 || correctIndex >= options.length) {
                return null;
            }
            return {
                question: item.question,
                options,
                correctIndex,
                explanation: typeof item.explanation === 'string' ? item.explanation : '',
            };
        })
        .filter(Boolean);
}

function buildShuffledQuizQuestions(baseQuestions) {
    const randomizedQuestions = shuffleArray(baseQuestions);
    return randomizedQuestions.map((item) => {
        const optionEntries = item.options.map((option, index) => ({
            text: option,
            isCorrect: index === item.correctIndex,
        }));
        const shuffledOptions = shuffleArray(optionEntries);
        const nextCorrectIndex = shuffledOptions.findIndex((entry) => entry.isCorrect);
        return {
            question: item.question,
            options: shuffledOptions.map((entry) => entry.text),
            correctIndex: nextCorrectIndex >= 0 ? nextCorrectIndex : 0,
            explanation: item.explanation,
        };
    });
}

function loadQuizQuestions(questions) {
    if (!Array.isArray(questions) || questions.length === 0) {
        clearQuizWidget();
        return;
    }

    const baseQuestions = prepareBaseQuizQuestions(questions);
    if (baseQuestions.length === 0) {
        clearQuizWidget();
        return;
    }

    quizState.baseQuestions = baseQuestions;
    quizState.questions = buildShuffledQuizQuestions(baseQuestions);
    quizState.index = 0;
    quizState.score = 0;
    quizState.answered = false;

    if (quizEmpty) {
        quizEmpty.hidden = true;
    }
    if (quizWidget) {
        quizWidget.hidden = false;
    }
    if (quizRestartButton) {
        quizRestartButton.disabled = false;
    }
    renderQuizQuestion();
    updateRegenerateButtonsAvailability();
}

function reshuffleQuizQuestions() {
    if (quizState.baseQuestions.length === 0) {
        return;
    }
    quizState.questions = buildShuffledQuizQuestions(quizState.baseQuestions);
    quizState.index = 0;
    quizState.score = 0;
    quizState.answered = false;
    renderQuizQuestion();
    updateRegenerateButtonsAvailability();
}

async function regenerateQuizQuestions() {
    if (generationBusy) {
        return;
    }
    if (!state.apiKey) {
        setFlashcardStatus('Pirmiausia pradiniame ekrane \u012fra\u0161yk OpenAI API rakt\u0105.', 'error');
        showScreen('intro');
        introApiKeyInput?.focus();
        return;
    }
    if (!generationState.pdfText) {
        setFlashcardStatus('Pirmiausia sukurk turin\u012f i\u0161 PDF failo.', 'error');
        return;
    }

    const currentPlan = getSelectedFlashcardPreferences();
    const fallbackPlan = generationState.lastPlan || {};
    const desiredQuizCount = Math.max(
        3,
        currentPlan.quizCount || fallbackPlan.quizCount || 20
    );
    const regenPlan = {
        includeFlashcards: currentPlan.includeFlashcards,
        flashcardCount: currentPlan.flashcardCount,
        includeQuiz: true,
        quizCount: desiredQuizCount,
    };

    setGenerationBusy(true);
    setFlashcardStatus('Kuriame nauj\u0105 test\u0105 per OpenAI...', 'pending');

    try {
        const bundle = await fetchStudyBundleFromApi(generationState.pdfText, state.apiKey, {
            ...regenPlan,
            includeFlashcards: false,
        });
        const questions = Array.isArray(bundle.quizQuestions) ? bundle.quizQuestions : [];
        if (questions.length === 0) {
            throw new Error('Testo suformuoti nepavyko. Pabandyk dar kart\u0105 su ai\u0161kesniu PDF.');
        }
        loadQuizQuestions(questions);
        setFlashcardStatus('Naujas testas paruo\u0161tas! Pasitikrink save.', 'success');
        generationState.lastPlan = {
            ...regenPlan,
            includeFlashcards: currentPlan.includeFlashcards,
        };
    } catch (error) {
        console.error(error);
        setFlashcardStatus(error.message || 'Nepavyko atnaujinti testo.', 'error');
    } finally {
        setGenerationBusy(false);
    }
}

function renderQuizQuestion() {
    if (!quizWidget || quizState.questions.length === 0) {
        clearQuizWidget();
        return;
    }

    const total = quizState.questions.length;
    const current = quizState.questions[quizState.index];

    if (quizQuestion) {
        quizQuestion.textContent = current.question;
    }

    if (quizOptions) {
        quizOptions.innerHTML = '';
        current.options.forEach((optionText, index) => {
            const letter = String.fromCharCode(65 + index);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'quiz-option';
            button.dataset.optionIndex = String(index);
            button.setAttribute('aria-label', `${letter}. ${optionText}`);

            const letterSpan = document.createElement('span');
            letterSpan.className = 'quiz-option__letter';
            letterSpan.textContent = letter;

            const textSpan = document.createElement('span');
            textSpan.className = 'quiz-option__text';
            textSpan.textContent = optionText;

            button.append(letterSpan, textSpan);
            button.addEventListener('click', () => handleQuizOptionSelect(index));
            quizOptions.appendChild(button);
        });
    }

    if (quizProgress) {
        quizProgress.textContent = `${quizState.index + 1} / ${total}`;
    }
    if (quizFeedback) {
        quizFeedback.textContent = '';
    }
    if (quizNextButton) {
        quizNextButton.disabled = true;
        quizNextButton.textContent = quizState.index < total - 1 ? 'Kitas klausimas' : 'Baigti test\u0105';
    }

    quizState.answered = false;
}

function handleQuizOptionSelect(optionIndex) {
    if (!quizOptions || quizState.questions.length === 0 || quizState.answered) {
        return;
    }

    const current = quizState.questions[quizState.index];
    const correctIndex = current.correctIndex;
    const buttons = quizOptions.querySelectorAll('.quiz-option');

    buttons.forEach((button) => {
        button.disabled = true;
        button.classList.add('quiz-option--disabled');
    });

    if (optionIndex === correctIndex) {
        quizState.score += 1;
        buttons[optionIndex]?.classList.add('quiz-option--correct');
        if (quizFeedback) {
            quizFeedback.textContent = current.explanation
                ? `Teisingai! ${current.explanation}`
                : 'Teisingai!';
        }
    } else {
        buttons[optionIndex]?.classList.add('quiz-option--wrong');
        buttons[correctIndex]?.classList.add('quiz-option--correct');
        if (quizFeedback) {
            quizFeedback.textContent = current.explanation
                ? `Teisingas atsakymas: ${String.fromCharCode(65 + correctIndex)}. ${current.explanation}`
                : `Teisingas atsakymas: ${String.fromCharCode(65 + correctIndex)}.`;
        }
    }

    quizState.answered = true;
    if (quizNextButton) {
        quizNextButton.disabled = false;
    }
}

function showQuizSummary() {
    if (!quizWidget) {
        return;
    }
    const total = quizState.questions.length;
    if (quizQuestion) {
        quizQuestion.textContent = 'Testas baigtas!';
    }
    if (quizOptions) {
        quizOptions.innerHTML = '';
    }
    if (quizProgress) {
        quizProgress.textContent = `${total} / ${total}`;
    }
    if (quizFeedback) {
        quizFeedback.textContent = `Surinkai ${quizState.score} i\u0161 ${total}.`;
    }
    if (quizNextButton) {
        quizNextButton.disabled = true;
        quizNextButton.textContent = 'Pabaiga';
    }

    quizState.answered = true;
}

function updateNotepadEmptyState() {
    if (!notepadEmpty) return;
    const hasItems = notepadList && notepadList.children.length > 0;
    notepadEmpty.hidden = hasItems;
}

function createNotepadItem(text) {
    if (!notepadList) return null;
    const id = `scribble-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const item = document.createElement('li');
    item.className = 'notepad-item';
    item.dataset.id = id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.className = 'notepad-item__checkbox';

    const label = document.createElement('label');
    label.className = 'notepad-item__label';
    label.setAttribute('for', id);
    label.textContent = text;

    const pinBtn = document.createElement('button');
    pinBtn.type = 'button';
    pinBtn.className = 'notepad-item__pin';
    pinBtn.textContent = 'Prisegti';

    checkbox.addEventListener('change', () => {
        label.classList.toggle('notepad-item__label--done', checkbox.checked);
    });

    pinBtn.addEventListener('click', () => {
        createStickyNote(text);
        pinBtn.textContent = 'Prisegta!';
        pinBtn.disabled = true;
        setTimeout(() => {
            pinBtn.textContent = 'Prisegti';
            pinBtn.disabled = false;
        }, 1400);
    });

    item.append(checkbox, label, pinBtn);
    return item;
}

function updateStickyEmptyState() {
    if (!stickyEmpty) return;
    const hasNotes = stickyBoard && stickyBoard.children.length > 0;
    stickyEmpty.hidden = hasNotes;
}

function createStickyNote(text, options = {}) {
    if (!stickyBoard) return;
    const safeText = typeof text === 'string' ? text.trim() : '';
    if (!safeText) return;

    const { paletteIndex, tilt, id, skipPersist } = options;
    const paletteIdx =
        typeof paletteIndex === 'number' && STICKY_PALETTES[paletteIndex]
            ? paletteIndex
            : Math.floor(Math.random() * STICKY_PALETTES.length);
    const palette = STICKY_PALETTES[paletteIdx] || STICKY_PALETTES[0];
    if (!palette) return;

    const tiltDirection =
        tilt === 'left' || tilt === 'right'
            ? tilt
            : Math.random() > 0.5
            ? 'left'
            : 'right';
    const noteId = id || `sticky-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const note = document.createElement('article');
    note.className = 'sticky-note sticky-note--enter';
    note.setAttribute('role', 'note');
    note.setAttribute('tabindex', '0');
    note.dataset.stickyId = noteId;
    note.style.setProperty('--note-bg1', palette.bg1);
    note.style.setProperty('--note-bg2', palette.bg2);
    note.style.setProperty('--pin-color-strong', palette.pinStrong);
    note.style.setProperty('--pin-color-soft', palette.pinSoft);
    note.style.color = palette.text;

    if (tiltDirection === 'left') {
        note.classList.add('sticky-note--tilt-left');
    } else {
        note.classList.add('sticky-note--tilt-right');
    }

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'sticky-note__close';
    closeBtn.setAttribute('aria-label', 'Atsegti lapel\u012f');
    closeBtn.textContent = '\u00D7';

    const textEl = document.createElement('p');
    textEl.className = 'sticky-note__text';
    textEl.textContent = safeText;

    note.append(closeBtn, textEl);
    stickyBoard.prepend(note);
    updateStickyEmptyState();
    if (!skipPersist) {
        saveStickyNote({
            id: noteId,
            text: safeText,
            paletteIndex: paletteIdx,
            tilt: tiltDirection,
        });
        playChime('pin');
    }

    note.addEventListener('animationend', (event) => {
        if (event.animationName === 'pinPop') {
            note.classList.remove('sticky-note--enter');
        }
        if (event.animationName === 'noteFall' && note.classList.contains('sticky-note--leaving')) {
            note.remove();
            updateStickyEmptyState();
        }
    });

    closeBtn.addEventListener('click', () => dismissStickyNote(note));
    note.addEventListener('keyup', (event) => {
        if (event.key === 'Delete' || event.key === 'Backspace') {
            dismissStickyNote(note);
        }
    });
}

function saveStickyNote(noteData) {
    if (!noteData) return;
    const id = typeof noteData.id === 'string' ? noteData.id.trim() : '';
    const textValue = typeof noteData.text === 'string' ? noteData.text.trim() : '';
    if (!id || !textValue) return;

    const paletteIdx =
        typeof noteData.paletteIndex === 'number' && STICKY_PALETTES[noteData.paletteIndex]
            ? noteData.paletteIndex
            : 0;
    const entry = {
        id,
        text: textValue,
        paletteIndex: paletteIdx,
        tilt: noteData.tilt === 'left' ? 'left' : 'right',
    };

    stickyNotesState = stickyNotesState.filter((item) => item.id !== entry.id);
    stickyNotesState.unshift(entry);
    persistStickies();
}

function removeStickyNoteFromState(id) {
    if (!id) return;
    const next = stickyNotesState.filter((item) => item.id !== id);
    if (next.length !== stickyNotesState.length) {
        stickyNotesState = next;
        persistStickies();
    }
}

function persistStickies() {
    try {
        localStorage.setItem(STICKY_STORAGE_KEY, JSON.stringify(stickyNotesState));
    } catch (error) {
        // Storage may be unavailable; ignore politely.
    }
}

function dismissStickyNote(note) {
    if (!note || note.classList.contains('sticky-note--leaving')) return;

    const noteId = note.dataset.stickyId;
    if (noteId) {
        removeStickyNoteFromState(noteId);
    }

    const tilt = note.classList.contains('sticky-note--tilt-left') ? -8 : 8;
    note.style.setProperty('--fall-tilt', `${tilt}deg`);
    note.classList.add('sticky-note--leaving');
    playChime('unpin');
}



function clearStickyBoard() {
    if (!stickyBoard) return;
    const notes = Array.from(stickyBoard.children);
    notes.forEach((note, index) => {
        setTimeout(() => dismissStickyNote(note), index * 90);
    });
}

function playChime(type = 'pin') {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioContext) {
            audioContext = new AudioCtx();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        const baseFrequency = type === 'unpin' ? 360 : 520;
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(baseFrequency, now);
        oscillator.frequency.exponentialRampToValueAtTime(
            type === 'unpin' ? baseFrequency / 1.3 : baseFrequency * 1.18,
            now + 0.32
        );

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.65);
    } catch (error) {
        // Audio may be blocked; ignore politely.
    }
}

introForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const rawKey = introApiKeyInput?.value?.trim();

    if (!rawKey) {
        introApiKeyInput?.focus();
        return;
    }

    state.name = 'Emilija';
    state.apiKey = rawKey;
    persistApiKey(state.apiKey, introRememberKeyCheckbox ? introRememberKeyCheckbox.checked : false);
    updateGreetingNames();
    scheduleSplashHide(600);
    showScreen('tasks');
});

introToggleKeyBtn?.addEventListener('click', () => {
    if (!introApiKeyInput) return;
    const reveal = introApiKeyInput.type === 'password';
    introApiKeyInput.type = reveal ? 'text' : 'password';
    introToggleKeyBtn.textContent = reveal ? 'Sl\u0117pti' : 'Rodyti';
    introToggleKeyBtn.setAttribute('aria-pressed', reveal ? 'true' : 'false');
    introApiKeyInput.focus();
});

editSetupBtn?.addEventListener('click', () => {
    if (nameInput) {
        nameInput.value = state.name;
    }
    if (introApiKeyInput) {
        introApiKeyInput.value = state.apiKey;
    }
    updateGreetingNames();
    showScreen('intro');
});

if (window.pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.worker.min.js';
}

flashcardCard?.addEventListener('click', toggleFlashcardFace);
flashcardCard?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleFlashcardFace();
    }
});

flashcardPrevBtn?.addEventListener('click', () => {
    showFlashcardByIndex(flashcardState.index - 1);
});

flashcardNextBtn?.addEventListener('click', () => {
    showFlashcardByIndex(flashcardState.index + 1);
});

quizNextButton?.addEventListener('click', () => {
    if (quizState.questions.length === 0 || !quizState.answered) {
        return;
    }
    if (quizState.index < quizState.questions.length - 1) {
        quizState.index += 1;
        quizState.answered = false;
        renderQuizQuestion();
    } else {
        showQuizSummary();
    }
});

quizRestartButton?.addEventListener('click', () => {
    if (quizState.questions.length === 0) {
        return;
    }
    quizState.index = 0;
    quizState.score = 0;
    quizState.answered = false;
    renderQuizQuestion();
});

shuffleQuizBtn?.addEventListener('click', () => {
    reshuffleQuizQuestions();
});

regenerateQuizBtn?.addEventListener('click', () => {
    void regenerateQuizQuestions();
});

flashcardForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!pdfInput) return;

    if (!state.apiKey) {
        setFlashcardStatus('Pirmiausia pradiniame ekrane \u012fra\u0161yk OpenAI API rakt\u0105.', 'error');
        showScreen('intro');
        introApiKeyInput?.focus();
        return;
    }

    const file = pdfInput.files && pdfInput.files[0];
    if (!file) {
        setFlashcardStatus('Pasirinkti PDF fail\u0105.', 'error');
        if (pdfTrigger) {
            pdfTrigger.focus();
        } else {
            pdfInput?.focus();
        }
        return;
    }
    if (file.size > MAX_PDF_SIZE) {
        setFlashcardStatus('Pasirink PDF, ma\u017eesn\u012f nei 8 MB, kad veiktume greitai.', 'error');
        return;
    }

    setGenerationBusy(true);
    clearFlashcardWidget();
    clearQuizWidget();
    setFlashcardStatus('I\u0161traukiame svarbiausias pastabas i\u0161 PDF...', 'pending');

    try {
        const text = await extractTextFromPdf(file);
        if (!text) {
            throw new Error('Nepavyko nuskaityti teksto. Pabandyk PDF, kuriame tekstas yra pa\u017eymimas.');
        }

        const plan = getSelectedFlashcardPreferences();
        generationState.pdfText = text;
        generationState.lastPlan = plan;
        generationState.lastFileName = file && file.name ? file.name : generationState.lastFileName;
        updateRegenerateButtonsAvailability();
        const { includeFlashcards, includeQuiz } = plan;
        const actionLabel = includeFlashcards && includeQuiz
            ? 'Kuriame korteles ir test\u0105 per OpenAI...'
            : includeFlashcards
            ? 'Kuriame korteles per OpenAI...'
            : 'Kuriame test\u0105 per OpenAI...';
        setFlashcardStatus(actionLabel, 'pending');

        const bundle = await fetchStudyBundleFromApi(text, state.apiKey, plan);
        const cards = includeFlashcards ? bundle.flashcards : [];
        const quizQuestions = includeQuiz ? bundle.quizQuestions : [];
        let statusMessage = '';

        if (includeFlashcards) {
            if (!cards.length) {
                throw new Error('Korteli\u0173 negavome. Pabandyk ai\u0161kesn\u012f PDF arba pakoreguok turin\u012f.');
            }
            flashcardState.cards = cards;
            flashcardState.index = 0;
            flashcardState.flipped = false;
            renderFlashcard();
            statusMessage = 'Kortel\u0117s paruo\u0161tos!';
        } else {
            clearFlashcardWidget();
        }

        if (includeQuiz) {
            if (quizQuestions.length === 0) {
                if (quizEmpty) {
                    quizEmpty.hidden = false;
                    quizEmpty.textContent = 'Testo suformuoti nepavyko. Pabandyk dar kart\u0105 su ai\u0161kesniu PDF.';
                }
                throw new Error('Testo suformuoti nepavyko. Pabandyk dar kart\u0105 su ai\u0161kesniu PDF.');
            }
            loadQuizQuestions(quizQuestions);
            statusMessage = includeFlashcards
                ? 'Kortel\u0117s ir testas paruo\u0161ti! Apversk ir pasitikrink save.'
                : 'Testas paruo\u0161tas! Pasitikrink save.';
        } else {
            clearQuizWidget();
            if (quizEmpty) {
                quizEmpty.hidden = false;
                quizEmpty.textContent = quizNotSelectedText;
            }
        }

        setFlashcardStatus(statusMessage || 'Viskas paruo\u0161ta!', 'success');
        if (includeFlashcards) {
            flashcardCard?.focus({ preventScroll: true });
        }
    } catch (error) {
        console.error(error);
        setFlashcardStatus(error.message || 'Kuriant korteles \u012fvyko klaida.', 'error');
    } finally {
        setGenerationBusy(false);
    }
});

notepadForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!notepadInput) return;
    const value = notepadInput.value.trim();
    if (!value) {
        notepadInput.focus();
        return;
    }

    const item = createNotepadItem(value);
    if (item && notepadList) {
        notepadList.prepend(item);
        notepadInput.value = '';
        updateNotepadEmptyState();
        playChime('pin');
    }
    notepadInput.focus();
});

notepadInput?.addEventListener('blur', () => {
    if (notepadInput.value.trim().length === 0) {
        ensureNotepadPlaceholder(true);
    }
});

clearStickiesBtn?.addEventListener('click', () => {
    clearStickyBoard();
    setTimeout(updateStickyEmptyState, 500);
});

loadStoredApiKey();
loadStoredStickies();
if (nameInput) {
    nameInput.value = state.name;
}
updateGreetingNames();

setFlashcardStatus('');

updateNotepadEmptyState();
updateStickyEmptyState();
if (weekIndicator) {
    setWeekIndicatorCollapsed(false);
    weekIndicator.addEventListener('click', () => {
        toggleWeekIndicatorCollapsed();
    });
    weekIndicator.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleWeekIndicatorCollapsed();
        }
    });
}
updateWeekIndicator();
scheduleWeekIndicatorUpdate();
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateWeekIndicator();
    }
});
showScreen('intro');
scheduleSplashHide();
ensureNotepadPlaceholder(true);
