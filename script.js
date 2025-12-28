'use strict';

const rootElement = document.documentElement;
const screens = document.querySelectorAll('.screen');
const hero = document.querySelector('.hero');
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
const flashcardShuffleBtn = document.getElementById('flashcard-shuffle');
const flashcardCounter = document.getElementById('flashcard-counter');
const flashcardTags = document.getElementById('flashcard-tags');
const generationNoteInput = document.getElementById('generation-note');
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
const timetableWeekNumber = document.getElementById('timetable-week-number');
const timetableWeekLabel = document.querySelector('.timetable-card__week-label');
const timetableWeekRange = document.getElementById('timetable-week-range');
const timetableWeekContent = document.getElementById('timetable-week-content');
const timetableWeekEmpty = document.getElementById('timetable-week-empty');
const timetableToggleWeekBtn = document.getElementById('timetable-toggle-week');
const rewardMeter = document.querySelector('.reward-meter');
const rewardCount = document.getElementById('reward-count');
const importantDatesList = document.getElementById('important-dates-list');
const importantDatesEmpty = document.getElementById('important-dates-empty');
const importantDatesStatus = document.getElementById('important-dates-status');
const importantDatesRefreshBtn = document.getElementById('important-dates-refresh');
const importantDatesFilters = document.getElementById('important-dates-filters');
const importantDatesToggleEmbedBtn = document.getElementById('important-dates-toggle-embed');
const importantDatesEmbed = document.getElementById('important-dates-embed');
const importantDatesHighlightTitle = document.getElementById('important-next-title');
const importantDatesHighlightDate = document.getElementById('important-next-date');
const importantDatesHighlightCountdown = document.getElementById('important-next-countdown');
const importantDatesCountdownLabel = document.getElementById('important-next-countdown-label');
const importantDatesHighlightBadge = document.getElementById('important-next-badge');
const importantDatesHighlightNote = document.getElementById('important-next-note');
const importantDatesSheetLink = document.getElementById('important-dates-sheet-link');
let layoutTopSyncFrameId = null;

const quizWidget = document.getElementById('quiz-widget');
const quizEmpty = document.getElementById('quiz-empty');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const quizProgress = document.getElementById('quiz-progress');
const quizFeedback = document.getElementById('quiz-feedback');
const quizStartButton = document.getElementById('quiz-start');
const quizStopButton = document.getElementById('quiz-stop');
const quizRestartButton = document.getElementById('quiz-restart');
const quizEmptyDefaultText = quizEmpty?.textContent || '';
const quizNotSelectedText = 'Testas nebuvo pasirinktas. Pa\u017Eym\u0117k "ABCD test\u0105", jei jo reikia.';
const quizComfortValue = document.getElementById('quiz-comfort');
const quizScoreValue = document.getElementById('quiz-score');
const blockJamCard = document.querySelector('.blockjam-card');
const blockJamShell = document.querySelector('.blockjam');
const blockJamBoard = document.getElementById('blockjam-board');
const blockJamPieces = document.getElementById('blockjam-pieces');
const blockJamScoreValue = document.getElementById('blockjam-score');
const blockJamComboValue = document.getElementById('blockjam-combo');
const blockJamMovesValue = document.getElementById('blockjam-moves');
const blockJamStatusText = document.getElementById('blockjam-status');
const blockJamHintText = document.getElementById('blockjam-hint');
const blockJamResetButton = document.getElementById('blockjam-reset');
const blockJamRotateButton = document.getElementById('blockjam-rotate');
const blockJamQuizPanel = document.getElementById('blockjam-quiz-panel');
const blockJamQuizEmpty = document.getElementById('blockjam-quiz-empty');
const blockJamQuestionShell = document.getElementById('blockjam-question');
const blockJamQuestionLabel = document.getElementById('blockjam-question-label');
const blockJamQuestionProgress = document.getElementById('blockjam-question-progress');
const blockJamQuestionText = document.getElementById('blockjam-question-text');
const blockJamQuestionOptions = document.getElementById('blockjam-question-options');
const blockJamQuestionFeedback = document.getElementById('blockjam-question-feedback');

const pdfFileNameEmptyText = pdfFileName?.dataset?.empty || 'Failas nepasirinktas';
const PASSCODE = 'differentdimension';
const ZERO_WIDTH_SPACE_PATTERN = /[\u200B\u200C\u200D\u2060\uFEFF]/g;
const DEFAULT_BACKEND_ENDPOINT = 'https://pi-proxy.studtok.com/study-bundle';
const STUDY_BACKEND_ENDPOINT =
    window.PINK_STUDY_BACKEND ??
    document.documentElement?.dataset?.studyBackend ??
    DEFAULT_BACKEND_ENDPOINT;

const state = {
    name: 'Emilija',
    apiKey: '',
    activeCredential: '',
};

const flashcardState = {
    cards: [],
    index: 0,
    flipped: false,
    visited: new Set(),
    completedRun: false,
};
const flashcardHistory = new Set();

const QUIZ_AUTO_ADVANCE_DELAY_MS = 750;
const QUIZ_COMFORT_MESSAGES = {
    idle: 'Prad\u0117k, kai pasiruo\u0161i.',
    active: 'Ramiai spr\u0119sk \u2013 \u010dia be laikma\u010dio.',
    complete: 'Puiku! Pails\u0117k prie\u0161 kit\u0105 bandym\u0105.',
};

const quizState = {
    baseQuestions: [],
    questions: [],
    index: 0,
    score: 0,
    answered: false,
    completedRun: false,
    roundActive: false,
    autoAdvanceId: null,
    answeredCount: 0,
};

const generationState = {
    pdfText: '',
    lastPlan: null,
    lastFileName: '',
    modeTouched: false,
};

const BLOCKJAM_BOARD_SIZE = 8;
const BLOCKJAM_SET_SIZE = 3;
const BLOCKJAM_CLEAR_DELAY_MS = 340;
const BLOCKJAM_MATCH_MIN = 3;
const BLOCKJAM_DEFAULT_STATUS = 'Pasirink saldaini\u0173 fig\u016br\u0105 ir bakstelk lent\u0105.';
const BLOCKJAM_CANDY_LABELS = {
    'candy-berry': 'bra\u0161kinis saldainis',
    'candy-sherbet': 'sherbet\u0173 gabal\u0117lis',
    'candy-grape': 'vynuoginis kubelis',
    'candy-mint': 'm\u0117tinis trapukas',
    'candy-caramel': 'karamelinis blokelis',
    'candy-cocoa': 'kakavos plytel\u0117',
};
const BLOCKJAM_COLOR_KEYS = Object.keys(BLOCKJAM_CANDY_LABELS);
const BLOCKJAM_DEMO_QUIZ = [
    {
        question: 'Kiek laiko trunka 90 minu\u010di\u0173 paskaita?',
        options: ['45 min', '60 min', '1 val. 30 min', '2 val.'],
        correctIndex: 2,
        explanation: '90 minu\u010di\u0173 tai 1 valanda ir 30 minu\u010di\u0173.',
    },
    {
        question: 'Kokios spalvos yra Emilijos Block Jam saldainiai?',
        options: ['Tik m\u0117lyni', 'Ro\u017einiai ir \u0161okoladiniai', 'Geltoni', 'Tik juodi'],
        correctIndex: 1,
        explanation: 'Tematika paremta bra\u0161ki\u0173 glajumi ir \u0161okoladu.',
    },
    {
        question: 'Kiek blokeli\u0173 rinkin\u012f gauna Emilija vienu metu?',
        options: ['1', '2', '3', '5'],
        correctIndex: 2,
        explanation: 'Kaip originaliame Block Jam, vienu metu rodomi 3 blokai.',
    },
];
const BLOCKJAM_SHAPES = [
    {
        id: 'berry-line',
        name: 'Bra\u0161ki\u0173 juosta',
        color: 'candy-berry',
        cells: [
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
        ],
    },
    {
        id: 'mint-square',
        name: 'M\u0117tin\u0117 plytel\u0117',
        color: 'candy-mint',
        cells: [
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
        ],
    },
    {
        id: 'caramel-elbow',
        name: 'Karamelin\u0117 L',
        color: 'candy-caramel',
        cells: [
            [0, 0],
            [0, 1],
            [0, 2],
            [1, 2],
        ],
    },
    {
        id: 'cocoa-t',
        name: 'Kakavos T',
        color: 'candy-cocoa',
        cells: [
            [0, 0],
            [1, 0],
            [2, 0],
            [1, 1],
        ],
    },
    {
        id: 'sherbet-z',
        name: 'Serbent\u0173 zigzagas',
        color: 'candy-sherbet',
        cells: [
            [0, 0],
            [1, 0],
            [1, 1],
            [2, 1],
        ],
    },
    {
        id: 'grape-plus',
        name: 'Vynuoginis pliusas',
        color: 'candy-grape',
        cells: [
            [1, 0],
            [0, 1],
            [1, 1],
            [2, 1],
            [1, 2],
        ],
    },
    {
        id: 'mint-hook',
        name: 'M\u0117tin\u0117 kab\u0117',
        color: 'candy-mint',
        cells: [
            [0, 0],
            [1, 0],
            [2, 0],
            [2, 1],
        ],
    },
    {
        id: 'berry-corner',
        name: 'Bra\u0161ki\u0173 kampas',
        color: 'candy-berry',
        cells: [
            [0, 0],
            [0, 1],
            [1, 1],
            [2, 1],
        ],
    },
    {
        id: 'caramel-bar',
        name: 'Karamelinis baton\u0117lis',
        color: 'candy-caramel',
        cells: [
            [0, 0],
            [1, 0],
            [2, 0],
            [0, 1],
            [1, 1],
            [2, 1],
        ],
    },
    {
        id: 'cocoa-long',
        name: 'Kakavos kolona',
        color: 'candy-cocoa',
        cells: [
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3],
            [1, 3],
        ],
    },
    {
        id: 'sherbet-u',
        name: 'Sherbet\u0173 U',
        color: 'candy-sherbet',
        cells: [
            [0, 0],
            [0, 1],
            [1, 1],
            [2, 1],
            [2, 0],
        ],
    },
];
const blockJamCells = [];
const blockJamState = {
    board: [],
    queue: [],
    selectedIndex: null,
    ghostCells: [],
    ghostSignature: null,
    latestHover: null,
    isGameOver: false,
    score: 0,
    combo: 1,
    nextRewardAt: 150,
    questionPool: [],
    answeredCount: 0,
    hasQuiz: false,
    victoryNotified: false,
    demoActive: false,
};
let blockJamInitialised = false;
const blockJamDangerTimers = new Map();
const blockJamStatusDefaultText = blockJamStatusText?.textContent || BLOCKJAM_DEFAULT_STATUS;
const blockJamHintDefaultText = blockJamHintText?.textContent || '';

function blockJamHasQuiz() {
    return (blockJamState.hasQuiz || blockJamState.demoActive) && blockJamState.questionPool.length > 0;
}

function setBlockJamWaitingState(waiting) {
    blockJamShell?.classList.toggle('blockjam--waiting', waiting);
}

function loadBlockJamDemoQuiz() {
    if (!blockJamIsReady()) {
        return;
    }
    syncBlockJamWithQuizQuestions(BLOCKJAM_DEMO_QUIZ, { isDemo: true });
}

let generationBusy = false;
let flashcardForceFront = false;
const REWARD_STORAGE_KEY = 'pinkStudy.rewards';
const rewardState = {
    count: 0,
};

function shouldUseBackendProxy() {
    return state.activeCredential?.toLowerCase() === PASSCODE.toLowerCase() && Boolean(STUDY_BACKEND_ENDPOINT);
}

function hasGenerationCredential() {
    return Boolean(state.apiKey) || shouldUseBackendProxy();
}

// Remove invisible whitespace so pasted credentials match reliably.
function sanitiseCredentialInput(value) {
    if (typeof value !== 'string') {
        return '';
    }
    let cleaned = value;
    try {
        cleaned = cleaned.normalize('NFKC');
    } catch (error) {
        // Older browsers might not support normalize; ignore if so.
    }
    cleaned = cleaned.replace(ZERO_WIDTH_SPACE_PATTERN, '');
    return cleaned.replace(/\s+/g, '');
}

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
    const hasCredential = hasGenerationCredential();
    if (regenerateFlashcardsBtn) {
        const hasCards = flashcardState.cards.length > 0;
        regenerateFlashcardsBtn.disabled = generationBusy || !hasStoredText || !hasCredential || !hasCards;
    }
    if (regenerateQuizBtn) {
        const hasQuestions = quizState.baseQuestions.length > 0;
        regenerateQuizBtn.disabled = generationBusy || !hasStoredText || !hasCredential || !hasQuestions;
    }
    if (flashcardShuffleBtn) {
        const canShuffleCards = flashcardState.cards.length > 1;
        flashcardShuffleBtn.disabled = generationBusy || !canShuffleCards;
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

function renderRewardState() {
    const count = Math.max(0, Number.isFinite(rewardState.count) ? rewardState.count : 0);
    if (rewardCount) {
        rewardCount.textContent = String(count);
    }
    if (rewardMeter) {
        const accessibleCount =
            count === 1
                ? '1 balto \u0161okolado plytel\u0117'
                : `${count} balt\u0173 \u0161okolado plyteli\u0173`;
        rewardMeter.setAttribute('aria-label', `Baltas \u0161okoladas: ${accessibleCount}`);
    }
    scheduleLayoutTopSync();
}

function scheduleLayoutTopSync() {
    if (!weekIndicator || !rootElement) {
        return;
    }
    if (layoutTopSyncFrameId !== null) {
        cancelAnimationFrame(layoutTopSyncFrameId);
    }
    layoutTopSyncFrameId = requestAnimationFrame(() => {
        const indicatorHeight = weekIndicator.offsetHeight || 0;
        const safePadding = Math.max(Math.ceil(indicatorHeight + 28), 140);
        rootElement.style.setProperty('--layout-top-offset', `${safePadding}px`);
        layoutTopSyncFrameId = null;
    });
}

function persistRewardState() {
    try {
        localStorage.setItem(REWARD_STORAGE_KEY, String(rewardState.count || 0));
    } catch (error) {
        // Persistence is best effort only.
    }
}

let rewardPulseTimeoutId = null;
function pulseRewardMeter() {
    if (!rewardMeter) {
        return;
    }
    rewardMeter.classList.add('reward-meter--pulse');
    if (rewardPulseTimeoutId) {
        clearTimeout(rewardPulseTimeoutId);
    }
    rewardPulseTimeoutId = setTimeout(() => {
        rewardMeter?.classList.remove('reward-meter--pulse');
        rewardPulseTimeoutId = null;
    }, 520);
}

function awardReward(kind = 'bonus') {
    rewardState.count = Math.max(0, Number.isFinite(rewardState.count) ? rewardState.count : 0) + 1;
    renderRewardState();
    persistRewardState();
    pulseRewardMeter();
}

function loadRewardState() {
    try {
        const stored = localStorage.getItem(REWARD_STORAGE_KEY);
        if (stored) {
            const parsed = Number.parseInt(stored, 10);
            if (Number.isFinite(parsed) && parsed >= 0) {
                rewardState.count = parsed;
            }
        }
    } catch (error) {
        rewardState.count = 0;
    }
    renderRewardState();
}

function normaliseFlashcardText(value) {
    if (typeof value !== 'string') {
        return '';
    }
    return value.trim();
}

function clamp(value, min, max) {
    if (!Number.isFinite(value)) {
        return min;
    }
    if (min > max) {
        return min;
    }
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

function buildFlashcardKey(question, answer) {
    const q = normaliseFlashcardText(question).toLowerCase();
    const a = normaliseFlashcardText(answer).toLowerCase();
    if (!q && !a) {
        return null;
    }
    return `${q}|||${a}`;
}

function sanitiseFlashcardTags(tags) {
    if (!Array.isArray(tags)) {
        return [];
    }
    return tags
        .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
        .filter(Boolean);
}

function prepareFlashcardBatch(rawCards) {
    const seenThisBatch = new Set();
    const accepted = [];
    const keys = [];
    let duplicatesRemoved = 0;

    if (!Array.isArray(rawCards)) {
        return { cards: accepted, duplicatesRemoved, keys };
    }

    rawCards.forEach((card) => {
        const question = normaliseFlashcardText(card?.question);
        const answer = normaliseFlashcardText(card?.answer);
        const key = buildFlashcardKey(question, answer);
        if (!key || seenThisBatch.has(key) || flashcardHistory.has(key)) {
            duplicatesRemoved += 1;
            return;
        }
        seenThisBatch.add(key);
        keys.push(key);
        const base = card && typeof card === 'object' ? { ...card } : {};
        base.question = question;
        base.answer = answer;
        base.tags = sanitiseFlashcardTags(card?.tags);
        accepted.push(base);
    });

    return { cards: accepted, duplicatesRemoved, keys };
}

function persistFlashcardHistoryKeys(keys) {
    keys.forEach((key) => {
        if (typeof key === 'string' && key) {
            flashcardHistory.add(key);
        }
    });
}

function requestFlashcardFrontReset() {
    flashcardForceFront = true;
}

function resetFlashcardRunState() {
    flashcardState.visited = new Set();
    flashcardState.completedRun = false;
}

function registerFlashcardView(index) {
    if (!flashcardState.cards.length) {
        return;
    }
    if (!(flashcardState.visited instanceof Set)) {
        flashcardState.visited = new Set();
    }
    flashcardState.visited.add(index);
    if (!flashcardState.completedRun && flashcardState.visited.size === flashcardState.cards.length) {
        flashcardState.completedRun = true;
        awardReward('flashcards');
        setFlashcardStatus('Visas korteles per\u0117jai! Baltas \u0161okoladas prizui.', 'success');
    }
}

function resetQuizRunState() {
    quizState.completedRun = false;
}

function registerQuizCompletion() {
    if (!quizState.completedRun) {
        quizState.completedRun = true;
        awardReward('quiz');
        if (quizFeedback) {
            const base = quizFeedback.textContent || 'Testas baigtas!';
            const rewardSuffix = ' (+1 baltas \u0161okoladas!)';
            if (!base.includes('baltas \u0161okoladas')) {
                quizFeedback.textContent = `${base}${rewardSuffix}`;
            }
        }
    }
}

function clearQuizAutoAdvance() {
    if (quizState.autoAdvanceId) {
        clearTimeout(quizState.autoAdvanceId);
        quizState.autoAdvanceId = null;
    }
}

function updateQuizComfortIndicator() {
    if (!quizComfortValue) {
        return;
    }
    let mode = 'idle';
    if (quizState.roundActive) {
        mode = 'active';
    } else if (quizState.completedRun) {
        mode = 'complete';
    }
    const text = QUIZ_COMFORT_MESSAGES[mode] || QUIZ_COMFORT_MESSAGES.idle;
    quizComfortValue.textContent = text;
}

function updateQuizScoreboard() {
    if (quizScoreValue) {
        quizScoreValue.textContent = String(Math.max(0, quizState.score));
    }
    if (quizProgress) {
        quizProgress.textContent = String(Math.max(0, quizState.answeredCount));
    }
}

function updateQuizControlAvailability() {
    const hasQuestions = quizState.baseQuestions.length > 0;
    if (quizStartButton) {
        quizStartButton.disabled = !hasQuestions || quizState.roundActive;
        quizStartButton.textContent = quizState.roundActive ? 'Vyksta...' : 'Startuoti';
    }
    if (quizStopButton) {
        quizStopButton.disabled = !quizState.roundActive;
    }
    if (quizRestartButton) {
        quizRestartButton.disabled = !hasQuestions;
    }
}

function resetQuizRound(message = '') {
    clearQuizAutoAdvance();
    quizState.roundActive = false;
    quizState.answered = false;
    quizState.completedRun = false;
    quizState.score = 0;
    quizState.answeredCount = 0;
    if (quizState.baseQuestions.length > 0) {
        quizState.questions = buildShuffledQuizQuestions(quizState.baseQuestions);
        quizState.index = 0;
    } else {
        quizState.questions = [];
        quizState.index = 0;
    }
    updateQuizComfortIndicator();
    updateQuizScoreboard();
    renderQuizQuestion();
    if (quizFeedback) {
        quizFeedback.textContent = message
            ? message
            : quizState.baseQuestions.length > 0
            ? 'Paspausk "Startuoti" ir rink ta\u0161kus.'
            : '';
    }
    updateQuizControlAvailability();
}

function startQuizRound() {
    if (quizState.baseQuestions.length === 0) {
        return;
    }
    clearQuizAutoAdvance();
    quizState.roundActive = true;
    quizState.completedRun = false;
    quizState.score = 0;
    quizState.answeredCount = 0;
    quizState.index = 0;
    quizState.questions = buildShuffledQuizQuestions(quizState.baseQuestions);
    quizState.answered = false;
    updateQuizComfortIndicator();
    updateQuizScoreboard();
    renderQuizQuestion();
    if (quizFeedback) {
        quizFeedback.textContent = 'Spr\u0119sk savo tempu ir stabtel\u0117k, kai norisi.';
    }
    updateQuizControlAvailability();
}

function endQuizRound(reason = 'manual') {
    if (!quizState.baseQuestions.length) {
        return;
    }
    clearQuizAutoAdvance();
    const wasActive = quizState.roundActive;
    quizState.roundActive = false;
    updateQuizComfortIndicator();
    if (quizOptions) {
        const buttons = quizOptions.querySelectorAll('.quiz-option');
        buttons.forEach((button) => {
            button.disabled = true;
            button.classList.add('quiz-option--disabled');
        });
    }
    if (wasActive && quizFeedback) {
        const summary =
            reason === 'manual'
                ? `Sustabdei test\u0105. Surinkai ${quizState.score} ta\u0161kus.`
                : `Puikiai padirb\u0117ta! Surinkai ${quizState.score} ta\u0161kus.`;
        quizFeedback.textContent = summary;
    }
    if (wasActive) {
        registerQuizCompletion();
        updateQuizComfortIndicator();
    }
    updateQuizControlAvailability();
}

function advanceQuizQuestion() {
    if (quizState.baseQuestions.length === 0 || quizState.questions.length === 0) {
        return;
    }
    if (!quizState.roundActive) {
        renderQuizQuestion();
        return;
    }
    quizState.index += 1;
    if (quizState.index >= quizState.questions.length) {
        quizState.questions = buildShuffledQuizQuestions(quizState.baseQuestions);
        quizState.index = 0;
    }
    quizState.answered = false;
    renderQuizQuestion();
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const WEEK_LENGTH_DAYS = 7;
const WEEK_ROTATION_LENGTH = 2;
let weekIndicatorTimeoutId = null;
const TIMETABLE_CURRENT_LABEL = '\u0160ios savait\u0117s paskaitos';
const TIMETABLE_NEXT_LABEL = 'Ateinan\u010Dios savait\u0117s paskaitos';
const TIMETABLE_WEEK_ORDER = ['Pirmadienis', 'Antradienis', 'Tre\u010diadienis', 'Ketvirtadienis', 'Penktadienis', '\u0160e\u0161tadienis'];
const TIMETABLE_WEEKDAY_LABELS = ['Sekmadienis', 'Pirmadienis', 'Antradienis', 'Tre\u010diadienis', 'Ketvirtadienis', 'Penktadienis', '\u0160e\u0161tadienis'];
const IMPORTANT_DATES_MONTH_SHORT = ['Sau', 'Vas', 'Kov', 'Bal', 'Geg', 'Bir', 'Lie', 'Rgp', 'Rgs', 'Spa', 'Lap', 'Gru'];
const IMPORTANT_DATES_WEEKDAY_SHORT = ['Sek', 'Pir', 'Ant', 'Tre', 'Ket', 'Pen', '\u0160e'];
const IMPORTANT_DATES_MAX_UPCOMING = 6;
const importantDatesCsvUrl = importantDatesEmbed?.dataset?.sheetCsv || '';
const importantDatesSheetUrl = importantDatesEmbed?.dataset?.sheetUrl || importantDatesSheetLink?.href || '';
const importantDatesState = {
    items: [],
    filter: 'upcoming',
    loading: false,
    lastUpdated: null,
    highlightId: null,
};
let importantDatesAbortController = null;
let importantDatesCountdownTimeoutId = null;
const TIMETABLE_DATA = {
    1: {
        Antradienis: [
            {
                time: '12:10-13:45',
                title: 'Ma\u0161in\u0173 elementai (su kursiniu projektu)',
                location: 'P1 211',
                lecturer: 'Doc. Dr. Nikolaj \u0160e\u0161ok',
                type: 'Laboratoriniai darbai',
            },
            {
                time: '14:30-16:05',
                title: 'Ma\u0161in\u0173 elementai (su kursiniu projektu)',
                location: 'P2 505',
                lecturer: 'Doc. Dr. Nikolaj \u0160e\u0161ok',
                type: 'Pratybos',
            },
            {
                time: '16:20-17:55',
                title: 'Ma\u0161in\u0173 elementai (su kursiniu projektu)',
                location: 'P2 505',
                lecturer: 'Doc. Dr. Nikolaj \u0160e\u0161ok',
                type: 'Pratybos',
            },
        ],
        Tre\u010diadienis: [
            {
                time: '10:20-11:55',
                title: 'Med\u017Eiag\u0173 mechanika 2',
                location: 'P2 157',
                lecturer: 'Doc. Dr. Jurijus Tretjakovas',
                type: 'Paskaitos',
            },
            {
                time: '12:10-13:45',
                title: 'Matavim\u0173 teorija ir praktika (su kursiniu projektu)',
                location: 'P2 157',
                lecturer: 'Dr. Darius Vainorius',
                type: 'Paskaitos',
            },
            {
                time: '14:30-16:05',
                title: 'Specialyb\u0117s angl\u0173 kalba',
                location: 'P2 527',
                lecturer: 'Lina Valatkien\u0117',
                type: 'Pratybos',
            },
        ],
        Ketvirtadienis: [
            {
                time: '10:20-11:55',
                title: 'Matavim\u0173 teorija ir praktika (su kursiniu projektu)',
                location: 'P2 512',
                lecturer: 'Ieva \u0160vag\u017Edyt\u0117',
                type: 'Pratybos',
            },
            {
                time: '12:10-13:45',
                title: 'Ma\u0161in\u0173 elementai (su kursiniu projektu)',
                location: 'P2 157',
                lecturer: 'Doc. Dr. Nikolaj \u0160e\u0161ok',
                type: 'Paskaitos',
            },
        ],
        Penktadienis: [
            {
                time: '08:30-10:05',
                title: 'Biomechanini\u0173 sistem\u0173 projektavimas taikant CAD/CAM/CAE',
                location: 'P2 504',
                lecturer: 'Dr. Oleg Ardatov',
                type: 'Laboratoriniai darbai',
            },
            {
                time: '10:20-11:55',
                title: 'Biomechanini\u0173 sistem\u0173 projektavimas taikant CAD/CAM/CAE',
                location: 'P2 504',
                lecturer: 'Dr. Oleg Ardatov',
                type: 'Laboratoriniai darbai',
            },
            {
                time: '12:10-13:45',
                title: 'Biomechanini\u0173 sistem\u0173 projektavimas taikant CAD/CAM/CAE',
                location: 'P2 512',
                lecturer: 'Dr. Oleg Ardatov',
                type: 'Paskaitos',
            },
            {
                time: '14:30-16:05',
                title: '\u017Dmogaus anatomija',
                location: 'P1 324',
                lecturer: 'Dr. R\u016Bta Dadelien\u0117',
                type: 'Paskaitos',
            },
        ],
    },
    2: {
        Tre\u010diadienis: [
            {
                time: '10:20-11:55',
                title: 'Med\u017Eiag\u0173 mechanika 2',
                location: 'P2 157',
                lecturer: 'Doc. Dr. Jurijus Tretjakovas',
                type: 'Paskaitos',
            },
            {
                time: '12:10-13:45',
                title: 'Matavim\u0173 teorija ir praktika (su kursiniu projektu)',
                location: 'P2 157',
                lecturer: 'Dr. Darius Vainorius',
                type: 'Paskaitos',
            },
            {
                time: '14:30-16:05',
                title: 'Specialyb\u0117s angl\u0173 kalba',
                location: 'P2 527',
                lecturer: 'Lina Valatkien\u0117',
                type: 'Pratybos',
            },
        ],
        Ketvirtadienis: [
            {
                time: '10:20-11:55',
                title: 'Matavim\u0173 teorija ir praktika (su kursiniu projektu)',
                location: 'P1 221',
                lecturer: 'Augustas Rotmanas',
                type: 'Laboratoriniai darbai',
            },
            {
                time: '12:10-13:45',
                title: 'Ma\u0161in\u0173 elementai (su kursiniu projektu)',
                location: 'P2 157',
                lecturer: 'Doc. Dr. Nikolaj \u0160e\u0161ok',
                type: 'Paskaitos',
            },
        ],
        Penktadienis: [
            {
                time: '10:20-11:55',
                title: 'Med\u017Eiag\u0173 mechanika 2',
                location: 'P2 510',
                lecturer: 'Doc. Dr. Ona Luko\u0161evi\u010dien\u0117',
                type: 'Pratybos',
            },
            {
                time: '12:10-13:45',
                title: 'Med\u017Eiag\u0173 mechanika 2',
                location: 'P2 510',
                lecturer: 'Doc. Dr. Ona Luko\u0161evi\u010dien\u0117',
                type: 'Laboratoriniai darbai',
            },
            {
                time: '14:30-16:05',
                title: '\u017Dmogaus anatomija',
                location: 'P1 324',
                lecturer: 'Dr. R\u016Bta Dadelien\u0117',
                type: 'Paskaitos',
            },
            {
                time: '16:20-17:55',
                title: '\u017Dmogaus anatomija',
                location: 'P1 324',
                lecturer: 'Dr. R\u016Bta Dadelien\u0117',
                type: 'Pratybos',
            },
        ],
    },
};
let timetableViewOffset = 0;
let lastRenderedRotationIndex = null;
const latestWeekContext = {
    rotationIndex: 0,
    weekStart: null,
};

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

function getTimetableDayNameForDate(date) {
    const label = TIMETABLE_WEEKDAY_LABELS[date.getDay()] || '';
    return TIMETABLE_WEEK_ORDER.includes(label) ? label : '';
}

function shouldAutoFocusTimetableToday(now = new Date()) {
    const day = now.getDay();
    if (day < 1 || day > 5) {
        return false;
    }
    if (now.getHours() >= 12) {
        return false;
    }
    return state.activeCredential?.toLowerCase() === PASSCODE.toLowerCase();
}

function formatMonthDay(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return month + '-' + day;
}

function shouldPreferNextWeekView(date) {
    const day = date.getDay();
    const minutes = date.getHours() * 60 + date.getMinutes();
    if (day === 5 && minutes >= 12 * 60) {
        return true;
    }
    if (day === 6 || day === 0) {
        return true;
    }
    return false;
}

function getInitialTimetableViewOffset(date) {
    return shouldPreferNextWeekView(date) ? 1 : 0;
}

function updateTimetableToggleLabel() {
    if (!timetableToggleWeekBtn) {
        return;
    }
    const showingCurrentWeek = timetableViewOffset === 0;
    timetableToggleWeekBtn.textContent = showingCurrentWeek
        ? 'Per\u017ei\u016br\u0117ti ateinan\u010Di\u0105 savait\u0119'
        : 'Gr\u012f\u017eti \u012f \u0161i\u0105 savait\u0119';
    timetableToggleWeekBtn.setAttribute('aria-pressed', showingCurrentWeek ? 'false' : 'true');
}

function autoFocusTimetableOnToday(now = new Date()) {
    if (!shouldAutoFocusTimetableToday(now) || !latestWeekContext.weekStart) {
        return;
    }
    const dayName = getTimetableDayNameForDate(now);
    if (!dayName) {
        return;
    }
    if (timetableViewOffset !== 0) {
        timetableViewOffset = 0;
        updateTimetableToggleLabel();
    }
    renderTimetableSection({ autoFocusDayName: dayName });
}

function renderTimetableSection(options = {}) {
    const { autoFocusDayName = null } = options;
    if (!timetableWeekContent) {
        return;
    }
    const weekStart = latestWeekContext.weekStart;
    const rotationIndex = latestWeekContext.rotationIndex;
    if (!weekStart) {
        timetableWeekContent.textContent = '';
        if (timetableWeekEmpty) {
            timetableWeekEmpty.hidden = false;
        }
        return;
    }

    const viewOffset = ((timetableViewOffset % WEEK_ROTATION_LENGTH) + WEEK_ROTATION_LENGTH) % WEEK_ROTATION_LENGTH;
    const normalizedRotationIndex =
        ((rotationIndex + viewOffset) % WEEK_ROTATION_LENGTH + WEEK_ROTATION_LENGTH) % WEEK_ROTATION_LENGTH;
    const weekNumber = normalizedRotationIndex + 1;
    const isCurrentWeek = viewOffset === 0;
    if (timetableWeekLabel) {
        timetableWeekLabel.textContent = isCurrentWeek ? TIMETABLE_CURRENT_LABEL : TIMETABLE_NEXT_LABEL;
    }
    if (timetableWeekNumber) {
        timetableWeekNumber.textContent = weekNumber + ' savait\u0117';
    }

    const displayStart = new Date(weekStart);
    displayStart.setDate(displayStart.getDate() + viewOffset * WEEK_LENGTH_DAYS);
    const displayEnd = new Date(displayStart);
    displayEnd.setDate(displayEnd.getDate() + WEEK_LENGTH_DAYS - 1);

    if (timetableWeekRange) {
        timetableWeekRange.textContent = formatMonthDay(displayStart) + ' \u2013 ' + formatMonthDay(displayEnd);
    }
    const weekData = TIMETABLE_DATA[weekNumber];
    timetableWeekContent.innerHTML = '';
    timetableWeekContent.setAttribute('role', 'list');

    const emptyMessage = isCurrentWeek
        ? '\u0160ios savait\u0117s planas dar nepildytas.'
        : 'Ateinan\u010Dios savait\u0117s planas dar nepildytas.';

    if (!weekData) {
        if (timetableWeekEmpty) {
            timetableWeekEmpty.textContent = emptyMessage;
            timetableWeekEmpty.hidden = false;
        }
        timetableWeekContent.setAttribute('aria-hidden', 'true');
        return;
    }

    const dayEntries = TIMETABLE_WEEK_ORDER
        .map((dayName) => ({
            dayName,
            sessions: Array.isArray(weekData[dayName]) ? weekData[dayName] : [],
        }))
        .filter((entry) => entry.sessions.length > 0);

    if (dayEntries.length === 0) {
        if (timetableWeekEmpty) {
            timetableWeekEmpty.textContent = emptyMessage;
            timetableWeekEmpty.hidden = false;
        }
        timetableWeekContent.setAttribute('aria-hidden', 'true');
        return;
    }

    const todaysDayName =
        !autoFocusDayName && isCurrentWeek ? getTimetableDayNameForDate(new Date()) : '';
    const defaultOpenDayName =
        todaysDayName && dayEntries.some((entry) => entry.dayName === todaysDayName) ? todaysDayName : '';

    const fragment = document.createDocumentFragment();
    let matchedAutoFocusDay = false;

    dayEntries.forEach((entry, index) => {
        const dayWrapper = document.createElement('details');
        dayWrapper.className = 'timetable-day';
        dayWrapper.setAttribute('role', 'listitem');
        const shouldAutoOpen = isCurrentWeek && Boolean(autoFocusDayName) && autoFocusDayName === entry.dayName;
        const shouldDefaultOpen =
            !autoFocusDayName &&
            (defaultOpenDayName ? entry.dayName === defaultOpenDayName : index === 0);
        dayWrapper.open = shouldAutoOpen || shouldDefaultOpen;
        if (shouldAutoOpen) {
            matchedAutoFocusDay = true;
        }

        const summary = document.createElement('summary');
        summary.className = 'timetable-day__summary';
        const nameEl = document.createElement('span');
        nameEl.className = 'timetable-day__name';
        nameEl.textContent = entry.dayName;
        summary.appendChild(nameEl);

        const countEl = document.createElement('span');
        countEl.className = 'timetable-day__count';
        countEl.textContent =
            entry.sessions.length === 1 ? '1 paskaita' : `${entry.sessions.length} paskaitos`;
        summary.appendChild(countEl);
        dayWrapper.appendChild(summary);

        const body = document.createElement('div');
        body.className = 'timetable-day__body';
        dayWrapper.appendChild(body);

        const sessionsList = document.createElement('ul');
        sessionsList.className = 'timetable-card__sessions';
        body.appendChild(sessionsList);

        entry.sessions.forEach((session) => {
            const sessionItem = document.createElement('li');
            sessionItem.className = 'timetable-card__session';
            sessionsList.appendChild(sessionItem);

            if (session.time) {
                const timeEl = document.createElement('span');
                timeEl.className = 'timetable-card__session-time';
                timeEl.textContent = session.time;
                sessionItem.appendChild(timeEl);
            }

            const titleEl = document.createElement('p');
            titleEl.className = 'timetable-card__session-title';
            titleEl.textContent = session.title || '\u2014';
            sessionItem.appendChild(titleEl);

            const metaParts = [];
            if (session.location) {
                metaParts.push(session.location);
            }
            if (session.lecturer) {
                metaParts.push(session.lecturer);
            }
            if (session.type) {
                metaParts.push(session.type);
            }
            if (metaParts.length > 0) {
                const metaEl = document.createElement('span');
                metaEl.className = 'timetable-card__session-meta';
                metaEl.textContent = metaParts.join(' \u2022 ');
                sessionItem.appendChild(metaEl);
            }

            if (session.note) {
                const noteEl = document.createElement('span');
                noteEl.className = 'timetable-card__session-note';
                noteEl.textContent = session.note;
                sessionItem.appendChild(noteEl);
            }
        });

        fragment.appendChild(dayWrapper);
    });

    timetableWeekContent.appendChild(fragment);
    if (autoFocusDayName && !matchedAutoFocusDay) {
        const firstDay = timetableWeekContent.querySelector('.timetable-day');
        if (firstDay) {
            firstDay.open = true;
        }
    }
    timetableWeekContent.removeAttribute('aria-hidden');
    if (timetableWeekEmpty) {
        timetableWeekEmpty.hidden = true;
    }
}

function updateWeekIndicator(now = new Date()) {
    const rotationIndex = getWeekRotationIndex(now);
    const weekNumber = rotationIndex + 1;

    if (weekIndicatorValue) {
        weekIndicatorValue.textContent = weekNumber + ' savait\u0117';
    }

    const weekStart = getWeekStart(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + WEEK_LENGTH_DAYS - 1);

    if (weekIndicatorRange) {
        weekIndicatorRange.textContent = formatMonthDay(weekStart) + ' \u2013 ' + formatMonthDay(weekEnd);
    }
    if (weekIndicator) {
        weekIndicator.hidden = false;
        weekIndicator.dataset.week = String(weekNumber);
    }

    const desiredOffset = getInitialTimetableViewOffset(now);
    const needsReset = lastRenderedRotationIndex === null || lastRenderedRotationIndex !== rotationIndex;
    const offsetChanged = !needsReset && timetableViewOffset !== desiredOffset;
    if (needsReset || offsetChanged) {
        timetableViewOffset = desiredOffset;
        updateTimetableToggleLabel();
    }

    lastRenderedRotationIndex = rotationIndex;
    latestWeekContext.rotationIndex = rotationIndex;
    latestWeekContext.weekStart = new Date(weekStart);
    renderTimetableSection();
    scheduleLayoutTopSync();
}

function scheduleWeekIndicatorUpdate() {
    if (!weekIndicator && !timetableWeekContent) {
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

function parseCsvRows(text) {
    const rows = [];
    if (typeof text !== 'string' || text.trim().length === 0) {
        return rows;
    }
    let current = '';
    let inQuotes = false;
    let row = [];
    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }
        if (char === ',' && !inQuotes) {
            row.push(current);
            current = '';
            continue;
        }
        if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && text[i + 1] === '\n') {
                i += 1;
            }
            row.push(current);
            rows.push(row);
            row = [];
            current = '';
            continue;
        }
        current += char;
    }
    if (row.length > 0 || current !== '') {
        row.push(current);
        rows.push(row);
    }
    return rows.filter((cells) => cells.some((cell) => typeof cell === 'string' && cell.trim().length > 0));
}

function findColumnIndex(headers, candidates) {
    if (!Array.isArray(headers)) {
        return -1;
    }
    return headers.findIndex((header) =>
        candidates.some((term) => typeof header === 'string' && header.includes(term))
    );
}

function normaliseSpreadsheetDate(value) {
    if (value === undefined || value === null) {
        return null;
    }
    const raw = String(value).trim();
    if (!raw) {
        return null;
    }
    const numeric = Number(raw);
    if (!Number.isNaN(numeric) && numeric > 20000) {
        const excelEpoch = Date.UTC(1899, 11, 30);
        const excelDate = new Date(excelEpoch + numeric * MS_PER_DAY);
        excelDate.setHours(12, 0, 0, 0);
        return excelDate;
    }
    const cleaned = raw.replace(/[\/.]/g, '-').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
    const parsedValue = Date.parse(cleaned);
    if (!Number.isNaN(parsedValue)) {
        const parsedDate = new Date(parsedValue);
        parsedDate.setHours(12, 0, 0, 0);
        return parsedDate;
    }
    const fallbackMatch = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
    if (fallbackMatch) {
        const [, dayPart, monthPart, yearPart] = fallbackMatch;
        const year = yearPart.length === 2 ? 2000 + Number(yearPart) : Number(yearPart);
        const fallbackDate = new Date(year, Number(monthPart) - 1, Number(dayPart), 12, 0, 0, 0);
        return fallbackDate;
    }
    return null;
}

function extractTimeFromValue(value) {
    if (value === undefined || value === null) {
        return '';
    }
    const textValue = String(value);
    const match = textValue.match(/(\d{1,2}:\d{2})(?:\s*[-–]\s*(\d{1,2}:\d{2}))?/);
    if (!match) {
        return '';
    }
    if (match[2]) {
        return `${match[1]}\u2013${match[2]}`;
    }
    return match[1];
}

function normaliseExternalUrl(value) {
    if (!value) {
        return '';
    }
    const trimmed = String(value).trim();
    if (!trimmed) {
        return '';
    }
    if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('#')) {
        return trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    }
    return `https://${trimmed}`;
}

function buildImportantDateEntriesFromCsv(text) {
    const rows = parseCsvRows(text);
    if (!rows || rows.length < 2) {
        return [];
    }
    const headers = rows[0].map((cell) => (cell || '').trim().toLowerCase());
    const columnMap = {
        date: findColumnIndex(headers, ['data', 'deadline', 'termin', 'date']),
        title: findColumnIndex(headers, ['pavadin', 'tema', 'title', 'dalykas']),
        type: findColumnIndex(headers, ['tip', 'kategor', 'type']),
        note: findColumnIndex(headers, ['pastab', 'note', 'komentar', 'apras']),
        url: findColumnIndex(headers, ['nuorod', 'url', 'link']),
        time: findColumnIndex(headers, ['laik', 'time']),
        location: findColumnIndex(headers, ['vieta', 'location', 'auditor']),
    };

    const items = [];
    rows.slice(1).forEach((row, index) => {
        const rawDateValue =
            columnMap.date >= 0 && row[columnMap.date] !== undefined ? row[columnMap.date] : row[0];
        const parsedDate = normaliseSpreadsheetDate(rawDateValue);
        if (!parsedDate) {
            return;
        }
        const titleSource = columnMap.title >= 0 ? row[columnMap.title] : '';
        const title = (titleSource || '').trim() || 'Be pavadinimo';
        const type = columnMap.type >= 0 ? (row[columnMap.type] || '').trim() : '';
        const note = columnMap.note >= 0 ? (row[columnMap.note] || '').trim() : '';
        const url = columnMap.url >= 0 ? (row[columnMap.url] || '').trim() : '';
        const location = columnMap.location >= 0 ? (row[columnMap.location] || '').trim() : '';
        const explicitTime = columnMap.time >= 0 ? (row[columnMap.time] || '').trim() : '';
        const derivedTime = explicitTime || extractTimeFromValue(rawDateValue);
        items.push({
            id: `${parsedDate.getTime()}-${index}`,
            date: parsedDate,
            title,
            type,
            note,
            url: normaliseExternalUrl(url),
            timeText: derivedTime,
            location,
        });
    });
    items.sort((a, b) => a.date - b.date);
    return items;
}

function setImportantDatesStatus(message, tone = 'muted') {
    if (!importantDatesStatus) {
        return;
    }
    importantDatesStatus.textContent = message;
    importantDatesStatus.dataset.tone = tone;
}

function formatImportantDateHeadline(date) {
    const dayName = TIMETABLE_WEEKDAY_LABELS[date.getDay()] || '';
    const monthShort = IMPORTANT_DATES_MONTH_SHORT[date.getMonth()] || '';
    const day = String(date.getDate()).padStart(2, '0');
    return `${dayName}, ${monthShort} ${day}`;
}

function formatImportantDateMeta(item) {
    const parts = [];
    const weekday = IMPORTANT_DATES_WEEKDAY_SHORT[item.date.getDay()] || '';
    const monthShort = IMPORTANT_DATES_MONTH_SHORT[item.date.getMonth()] || '';
    const day = String(item.date.getDate()).padStart(2, '0');
    if (weekday || monthShort) {
        parts.push(`${weekday} \u2022 ${monthShort} ${day}`.trim());
    }
    if (item.timeText) {
        parts.push(item.timeText);
    }
    if (item.location) {
        parts.push(item.location);
    }
    return parts.join(' \u2022 ');
}

function getImportantDateCountdown(date) {
    const todayStart = startOfDay(new Date());
    const targetStart = startOfDay(date);
    const diffDays = Math.round((targetStart - todayStart) / MS_PER_DAY);
    if (diffDays < 0) {
        return { value: 'Pra\u0117jo', label: '' };
    }
    if (diffDays === 0) {
        return { value: '\u0160iandien', label: '' };
    }
    if (diffDays === 1) {
        return { value: 'Rytoj', label: '' };
    }
    return { value: `${diffDays}`, label: 'dienos' };
}

function renderImportantDatesHighlight() {
    if (!importantDatesHighlightTitle || !importantDatesHighlightDate || !importantDatesHighlightCountdown) {
        return;
    }
    const items = importantDatesState.items || [];
    const todayStart = startOfDay(new Date());
    if (items.length === 0) {
        importantDatesHighlightTitle.textContent = 'Kol kas be termin\u0173';
        importantDatesHighlightDate.textContent = '\u2014';
        importantDatesHighlightCountdown.textContent = '\u2014';
        if (importantDatesCountdownLabel) {
            importantDatesCountdownLabel.textContent = '';
            importantDatesCountdownLabel.hidden = true;
        }
        if (importantDatesHighlightBadge) {
            importantDatesHighlightBadge.textContent = 'Terminas';
        }
        if (importantDatesHighlightNote) {
            importantDatesHighlightNote.textContent = 'Papildyk lentel\u0119, kai atsiras naujos datos.';
        }
        importantDatesState.highlightId = null;
        return;
    }
    const upcoming = items.find((item) => startOfDay(item.date) >= todayStart);
    if (!upcoming) {
        importantDatesHighlightTitle.textContent = 'Joki\u0173 termin\u0173 horizonte!';
        importantDatesHighlightDate.textContent = 'Galima atsikv\u0117pti';
        importantDatesHighlightCountdown.textContent = '\u2014';
        if (importantDatesCountdownLabel) {
            importantDatesCountdownLabel.textContent = '';
            importantDatesCountdownLabel.hidden = true;
        }
        if (importantDatesHighlightBadge) {
            importantDatesHighlightBadge.textContent = 'Laisva diena';
        }
        if (importantDatesHighlightNote) {
            importantDatesHighlightNote.textContent = 'Pasitikrink lentel\u0119, kai atsiras nauji darbai.';
        }
        importantDatesState.highlightId = null;
        return;
    }
    importantDatesState.highlightId = upcoming.id;
    importantDatesHighlightTitle.textContent = upcoming.title || 'Be pavadinimo';
    importantDatesHighlightDate.textContent = formatImportantDateHeadline(upcoming.date);
    const countdown = getImportantDateCountdown(upcoming.date);
    importantDatesHighlightCountdown.textContent = countdown.value;
    if (importantDatesCountdownLabel) {
        importantDatesCountdownLabel.textContent = countdown.label || '';
        importantDatesCountdownLabel.hidden = !countdown.label;
    }
    if (importantDatesHighlightBadge) {
        importantDatesHighlightBadge.textContent = upcoming.type || 'Terminas';
    }
    if (importantDatesHighlightNote) {
        importantDatesHighlightNote.textContent =
            upcoming.note || 'Nepamir\u0161k pasi\u017Eym\u0117ti kalendoriuje.';
    }
}

function getFilteredImportantDates() {
    const items = importantDatesState.items || [];
    if (items.length === 0) {
        return [];
    }
    const todayStart = startOfDay(new Date());
    const includePast = importantDatesState.filter === 'all';
    const baseItems = includePast ? items : items.filter((item) => startOfDay(item.date) >= todayStart);
    if (importantDatesState.filter === 'month') {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        return baseItems.filter((item) => item.date.getMonth() === month && item.date.getFullYear() === year);
    }
    if (importantDatesState.filter === 'upcoming') {
        return baseItems.slice(0, IMPORTANT_DATES_MAX_UPCOMING);
    }
    return baseItems;
}

function renderImportantDatesList() {
    if (!importantDatesList) {
        return;
    }
    importantDatesList.textContent = '';
    const filtered = getFilteredImportantDates();
    if (!filtered || filtered.length === 0) {
        if (importantDatesEmpty) {
            const emptyMessages = {
                upcoming: 'Joki\u0173 artimiausi\u0173 termin\u0173. Puiki proga pails\u0117ti!',
                month: '\u0160iame m\u0117nesyje nebeliko termin\u0173.',
                all: 'Svarbi\u0173 dat\u0173 dar n\u0117ra. Papildyk lentel\u0119.',
            };
            importantDatesEmpty.textContent =
                emptyMessages[importantDatesState.filter] || 'Kol kas nerasta dat\u0173.';
            importantDatesEmpty.hidden = false;
        }
        return;
    }
    if (importantDatesEmpty) {
        importantDatesEmpty.hidden = true;
    }
    const fragment = document.createDocumentFragment();
    filtered.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.className = 'important-dates__item';

        const dateEl = document.createElement('div');
        dateEl.className = 'important-dates__item-date';
        const dayEl = document.createElement('span');
        dayEl.className = 'important-dates__item-day';
        dayEl.textContent = String(item.date.getDate()).padStart(2, '0');
        const monthEl = document.createElement('span');
        monthEl.className = 'important-dates__item-month';
        monthEl.textContent = IMPORTANT_DATES_MONTH_SHORT[item.date.getMonth()] || '';
        dateEl.appendChild(dayEl);
        dateEl.appendChild(monthEl);
        listItem.appendChild(dateEl);

        const body = document.createElement('div');
        body.className = 'important-dates__item-body';

        const topRow = document.createElement('div');
        topRow.className = 'important-dates__item-top';
        const titleEl = document.createElement('p');
        titleEl.className = 'important-dates__item-title';
        titleEl.textContent = item.title || 'Be pavadinimo';
        topRow.appendChild(titleEl);
        if (item.type) {
            const badgeEl = document.createElement('span');
            badgeEl.className = 'important-dates__item-badge';
            badgeEl.textContent = item.type;
            topRow.appendChild(badgeEl);
        }
        body.appendChild(topRow);

        if (item.note) {
            const noteEl = document.createElement('p');
            noteEl.className = 'important-dates__item-note';
            noteEl.textContent = item.note;
            body.appendChild(noteEl);
        }

        const meta = document.createElement('div');
        meta.className = 'important-dates__item-meta';
        const metaText = document.createElement('span');
        metaText.textContent = formatImportantDateMeta(item);
        meta.appendChild(metaText);
        const linkTarget = item.url || importantDatesSheetUrl;
        if (linkTarget) {
            const linkEl = document.createElement('a');
            linkEl.href = linkTarget;
            linkEl.target = '_blank';
            linkEl.rel = 'noopener noreferrer';
            linkEl.textContent = item.url ? 'Detaliau' : 'Visas tvarkara\u0161tis';
            meta.appendChild(linkEl);
        }
        body.appendChild(meta);

        listItem.appendChild(body);
        fragment.appendChild(listItem);
    });
    importantDatesList.appendChild(fragment);
}

function renderImportantDatesSection() {
    renderImportantDatesHighlight();
    renderImportantDatesList();
    scheduleImportantDatesCountdownUpdate();
}

function scheduleImportantDatesCountdownUpdate() {
    if (importantDatesCountdownTimeoutId) {
        clearTimeout(importantDatesCountdownTimeoutId);
        importantDatesCountdownTimeoutId = null;
    }
    if (!importantDatesState.items || importantDatesState.items.length === 0) {
        return;
    }
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 5, 0);
    const delay = Math.max(60000, next.getTime() - now.getTime());
    importantDatesCountdownTimeoutId = window.setTimeout(() => {
        importantDatesCountdownTimeoutId = null;
        renderImportantDatesSection();
    }, delay);
}

async function refreshImportantDates(force = false) {
    if (!importantDatesList) {
        return;
    }
    if (!importantDatesCsvUrl) {
        setImportantDatesStatus('Svarbi\u0173 dat\u0173 lentel\u0117s nuoroda nerasta.', 'warning');
        if (importantDatesEmbed) {
            importantDatesEmbed.hidden = false;
        }
        return;
    }
    if (!force && !importantDatesState.loading && importantDatesState.items.length > 0) {
        renderImportantDatesSection();
        return;
    }
    if (importantDatesAbortController) {
        importantDatesAbortController.abort();
    }
    importantDatesAbortController = new AbortController();
    importantDatesState.loading = true;
    importantDatesRefreshBtn?.setAttribute('aria-busy', 'true');
    importantDatesRefreshBtn?.setAttribute('disabled', 'true');
    try {
        setImportantDatesStatus('Kraunama...', 'muted');
        const response = await fetch(importantDatesCsvUrl, {
            signal: importantDatesAbortController.signal,
            cache: 'no-store',
        });
        if (!response.ok) {
            throw new Error('Svarbi\u0173 dat\u0173 lentel\u0117 nepasiekiama.');
        }
        const textContent = await response.text();
        importantDatesState.items = buildImportantDateEntriesFromCsv(textContent);
        importantDatesState.lastUpdated = new Date();
        renderImportantDatesSection();
        const timestamp = importantDatesState.lastUpdated.toLocaleTimeString('lt-LT', {
            hour: '2-digit',
            minute: '2-digit',
        });
        setImportantDatesStatus(`Atnaujinta ${timestamp}`, 'success');
        if (importantDatesState.items.length === 0 && importantDatesEmpty) {
            importantDatesEmpty.hidden = false;
            importantDatesEmpty.textContent = 'Kol kas n\u0117ra svarbi\u0173 dat\u0173.';
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            return;
        }
        console.error(error);
        setImportantDatesStatus('Nepavyko \u012Fkelti duomen\u0173. Atidaryk lentel\u0119 apa\u010Dioje.', 'warning');
        if (importantDatesEmpty) {
            importantDatesEmpty.hidden = false;
            importantDatesEmpty.textContent = 'Nepavyko \u012Fkelti svarbi\u0173 dat\u0173. Bandyk dar kart\u0105.';
        }
        if (importantDatesToggleEmbedBtn && importantDatesEmbed) {
            importantDatesEmbed.hidden = false;
            importantDatesToggleEmbedBtn.setAttribute('aria-expanded', 'true');
        }
    } finally {
        importantDatesState.loading = false;
        importantDatesRefreshBtn?.removeAttribute('aria-busy');
        importantDatesRefreshBtn?.removeAttribute('disabled');
        importantDatesAbortController = null;
    }
}

function setImportantDatesFilter(filterValue) {
    if (!filterValue || filterValue === importantDatesState.filter) {
        return;
    }
    importantDatesState.filter = filterValue;
    if (importantDatesFilters) {
        const buttons = importantDatesFilters.querySelectorAll('[data-important-filter]');
        buttons.forEach((button) => {
            const isActive = button.dataset.importantFilter === filterValue;
            button.classList.toggle('chip--active', isActive);
        });
    }
    renderImportantDatesList();
}

function initImportantDatesSection() {
    if (!importantDatesList) {
        return;
    }
    if (importantDatesSheetUrl && importantDatesSheetLink) {
        importantDatesSheetLink.href = importantDatesSheetUrl;
    }
    importantDatesRefreshBtn?.addEventListener('click', () => refreshImportantDates(true));
    importantDatesFilters?.addEventListener('click', (event) => {
        const target = event.target.closest('[data-important-filter]');
        if (!target) {
            return;
        }
        setImportantDatesFilter(target.dataset.importantFilter);
    });
    if (importantDatesToggleEmbedBtn && importantDatesEmbed) {
        importantDatesToggleEmbedBtn.addEventListener('click', () => {
            const hidden = importantDatesEmbed.hidden;
            importantDatesEmbed.hidden = !hidden;
            importantDatesToggleEmbedBtn.setAttribute('aria-expanded', String(hidden));
            importantDatesToggleEmbedBtn.textContent = hidden
                ? 'Slėpti įterptą lentelę'
                : 'Rodyti įterptą lentelę';
        });
    }
    refreshImportantDates(true);
}

function setWeekIndicatorCollapsed(collapsed) {
    if (!weekIndicator) {
        return;
    }
    weekIndicator.classList.toggle('week-indicator--collapsed', collapsed);
    document.body.classList.toggle('week-indicator-collapsed', collapsed);
    weekIndicator.setAttribute('aria-expanded', String(!collapsed));
    scheduleLayoutTopSync();
}

function toggleWeekIndicatorCollapsed() {
    if (!weekIndicator) {
        return;
    }
    const collapsed = !weekIndicator.classList.contains('week-indicator--collapsed');
    setWeekIndicatorCollapsed(collapsed);
}

const introCredentialInput = document.getElementById('intro-credential');
const introToggleKeyBtn = document.getElementById('intro-toggle-key');
const introRememberCredentialCheckbox = document.getElementById('intro-remember-credential');
const editSetupBtn = document.getElementById('edit-setup');

introCredentialInput?.addEventListener('input', () => {
    introCredentialInput.setCustomValidity('');
});

const splash = document.querySelector('.welcome-splash');
const splashName = document.getElementById('splash-name');
const splashRunner = document.querySelector('.welcome-splash__runner');
const splashSalute = document.querySelector('.welcome-splash__salute');

const SPLASH_RUNNER_FRAMES = [
    'assets/emilija1.png',
    'assets/emilija2.png',
    'assets/emilija3.png',
];

const SPLASH_GREETINGS = [
    { salute: 'Labas,', name: '{name}!' },
    { salute: 'Sveika,', name: '{name}!' },
    { salute: '\u041f\u0440\u0438\u0432\u0435\u0442,', name: '{name}!' },
    { salute: 'Cze\u015b\u0107,', name: '{name}!' },
    { salute: 'Hola,', name: '{name}!' },
    { salute: 'Ol\u00e1,', name: '{name}!' },
    { salute: '\u0393\u03b5\u03b9\u03b1 \u03c3\u03bf\u03c5,', name: '{name}!' },
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



const initialPdfFile = pdfInput?.files && pdfInput.files[0];
updatePdfSelectionLabel(initialPdfFile || null);
handleGenerationToggleChange(generateFlashcardsToggle, generateQuizToggle);
generateFlashcardsToggle?.addEventListener('change', () => {
    generationState.modeTouched = true;
    handleGenerationToggleChange(generateFlashcardsToggle, generateQuizToggle);
});
generateQuizToggle?.addEventListener('change', () => {
    generationState.modeTouched = true;
    handleGenerationToggleChange(generateQuizToggle, generateFlashcardsToggle);
});

const CREDENTIAL_STORAGE_KEY = 'pinkStudy.credential';
const LEGACY_CREDENTIAL_STORAGE_KEY = 'pinkStudy.apiKey';
const FLASHCARD_MODEL = 'gpt-4.1-mini';
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MAX_PDF_CHARACTERS = 9000;
const MAX_PDF_SIZE = 8 * 1024 * 1024; // 8 MB


let splashTimeout;

function applyChristmasTheme() {
    const body = document.body;
    if (!body) return;
    const month = new Date().getMonth();
    const isActive = month === 11 || month === 0;
    body.classList.toggle('christmas-theme', isActive);
}

function showScreen(id) {
    screens.forEach((screen) => {
        const isTarget = screen.dataset.screen === id;
        screen.classList.toggle('screen--active', isTarget);
        if ('hidden' in screen) {
            screen.hidden = !isTarget;
        }
    });
    if (hero) {
        const showHero = id === 'intro';
        hero.hidden = !showHero;
        hero.classList.toggle('hero--hidden', !showHero);
    }
}

function pickSplashGreeting() {
    if (!SPLASH_GREETINGS.length) {
        return { salute: 'Labas,', name: `${state.name}!` };
    }
    const index = Math.floor(Math.random() * SPLASH_GREETINGS.length);
    return SPLASH_GREETINGS[index];
}

function formatSplashText(text, fallback) {
    return (text || fallback).replace(/\{name\}/g, state.name);
}

function updateGreetingNames() {
    const greeting = pickSplashGreeting();
    if (splashSalute) {
        splashSalute.textContent = formatSplashText(greeting.salute, 'Labas,');
    }
    if (splashName) {
        splashName.textContent = formatSplashText(greeting.name, `${state.name}!`);
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

function shouldDisplayFlashcardWidget() {
    return flashcardState.cards.length > 0;
}

function updateFlashcardWidgetVisibility() {
    if (!flashcardWidget) return;
    flashcardWidget.hidden = !shouldDisplayFlashcardWidget();
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
    if (shouldUseBackendProxy()) {
        return fetchStudyBundleViaBackend(text, generationPlan);
    }
    return fetchStudyBundleViaOpenAI(text, apiKey, generationPlan);
}

async function fetchStudyBundleViaBackend(text, generationPlan) {
    if (!STUDY_BACKEND_ENDPOINT) {
        throw new Error('Nenurodytas Pi proxy adresas. Patikrink STUDY_BACKEND_ENDPOINT reik\u0161m\u0119.');
    }
    const plan = generationPlan && typeof generationPlan === 'object' ? generationPlan : {};
    const learnerNote = typeof plan.note === 'string' ? plan.note.trim() : '';
    const enrichedText = learnerNote ? `Emilijos komentaras: ${learnerNote}\n\n${text}` : text;
    const payload = {
        pdf_text: enrichedText,
        plan: {
            includeFlashcards: Boolean(plan.includeFlashcards),
            flashcardCount: Number(plan.flashcardCount ?? 25),
            includeQuiz: Boolean(plan.includeQuiz),
            quizCount: Number(plan.quizCount ?? 0),
            flashcardLength: plan.flashcardLength || null,
            quizLength: plan.quizLength || null,
            quizMode: plan.quizMode || null,
        },
    };

    const response = await fetch(STUDY_BACKEND_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Passcode': PASSCODE,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(
            `Pi proxy klaida (${response.status}). ${details || 'Patikrink, ar tarnyba veikia ir ar IP teisingas.'}`
        );
    }

    const data = await response.json();
    return {
        flashcards: Array.isArray(data.flashcards) ? data.flashcards : [],
        quizQuestions: Array.isArray(data.quizQuestions) ? data.quizQuestions : [],
    };
}

async function fetchStudyBundleViaOpenAI(text, apiKey, generationPlan) {
    const plan = generationPlan && typeof generationPlan === 'object' ? generationPlan : {};
    const {
        includeFlashcards = true,
        flashcardCount = 25,
        includeQuiz = false,
        quizCount = 0,
        note = '',
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
            `Sudaryk ${quizCount} testinius klausimus, kuri\u0173 kiekvienas turi keturis atsakymo variantus. Klausimus formuluok taip, kad jie b\u016Bt\u0173 vidutinio ar auk\u0161tesnio sud\u0117tingumo ir reikalaut\u0173 keli\u0173 teksto detali\u0173. Kiekvienam klausimui pateik keturis \u012Ftikinamus, pana\u0161aus detali\u0161kumo atsakymo variantus, venk akivaizd\u017Eiai neteising\u0173 formuluo\u010Di\u0173. Variantus pateik lauke "options" (be raid\u017Ei\u0173), o teising\u0105 raid\u0119 (A, B, C arba D) \u012Fra\u0161yk lauke "correctOption". Jei gali, prid\u0117k trump\u0105 paai\u0161kinim\u0105 lauke "explanation".`
        );
    } else {
        instructionParts.push(
            'ABCD testo \u0161\u012Fkart neformuok - laukas "quizQuestions" turi b\u016Bti tu\u0161\u010Dias masyvas.'
        );
    }

    if (typeof note === 'string' && note.trim()) {
        instructionParts.push(`Papildoma Emilijos pastaba: ${note.trim()}.`);
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
        flashcardForceFront = false;
        updateFlashcardWidgetVisibility();
        flashcardCounter.textContent = '0 / 0';
        flashcardFront.textContent = '';
        flashcardBack.textContent = '';
        flashcardTags.innerHTML = '';
        if (flashcardShuffleBtn) {
            flashcardShuffleBtn.disabled = true;
        }
        return;
    }

    updateFlashcardWidgetVisibility();

    const total = flashcardState.cards.length;
    const current = flashcardState.cards[flashcardState.index];

    let flipped = flashcardState.flipped;
    if (flashcardForceFront) {
        flipped = false;
        flashcardCard.classList.add('flashcard-widget__card--no-transition');
    }
    flashcardCard.dataset.flipped = flipped ? 'true' : 'false';
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

    registerFlashcardView(flashcardState.index);

    const disableNav = total <= 1;
    flashcardPrevBtn.disabled = disableNav;
    flashcardNextBtn.disabled = disableNav;
    if (flashcardShuffleBtn) {
        flashcardShuffleBtn.disabled = generationBusy || total <= 1;
    }
    if (flashcardForceFront && flashcardCard) {
        requestAnimationFrame(() => {
            flashcardCard.classList.remove('flashcard-widget__card--no-transition');
        });
        flashcardForceFront = false;
    }
}

function showFlashcardByIndex(index) {
    const total = flashcardState.cards.length;
    if (total === 0) return;

    const wrappedIndex = (index + total) % total;
    if (flashcardState.completedRun && wrappedIndex === 0) {
        resetFlashcardRunState();
    }
    flashcardState.index = wrappedIndex;
    flashcardState.flipped = false;
    requestFlashcardFrontReset();
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

function shuffleFlashcards() {
    if (flashcardState.cards.length <= 1) {
        return;
    }
    const originalOrder = flashcardState.cards.slice();
    const shuffled = originalOrder.slice();

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }

    const unchanged = shuffled.every((card, index) => card === originalOrder[index]);
    if (unchanged && shuffled.length > 1) {
        shuffled.reverse();
    }

    flashcardState.cards = shuffled;
    flashcardState.index = 0;
    flashcardState.flipped = false;
    resetFlashcardRunState();
    requestFlashcardFrontReset();
    renderFlashcard();
    setFlashcardStatus('Kortel\u0117s i\u0161mai\u0161ytos! Pasiruo\u0161k netik\u0117tumams.', 'success');
    if (flashcardCard) {
        flashcardCard.focus({ preventScroll: true });
    }
}

function loadStoredCredential() {
    try {
        const stored =
            localStorage.getItem(CREDENTIAL_STORAGE_KEY) ??
            localStorage.getItem(LEGACY_CREDENTIAL_STORAGE_KEY);
        if (!stored) {
            return;
        }
        const storedIsPasscode = stored.toLowerCase() === PASSCODE;
        state.activeCredential = stored;
        state.apiKey = storedIsPasscode ? '' : stored;
        if (introCredentialInput) {
            introCredentialInput.value = stored;
        }
        if (introRememberCredentialCheckbox) {
            introRememberCredentialCheckbox.checked = true;
        }
        if (storedIsPasscode) {
            localStorage.setItem(CREDENTIAL_STORAGE_KEY, PASSCODE);
            localStorage.removeItem(LEGACY_CREDENTIAL_STORAGE_KEY);
        } else if (!localStorage.getItem(CREDENTIAL_STORAGE_KEY)) {
            localStorage.setItem(CREDENTIAL_STORAGE_KEY, stored);
            localStorage.removeItem(LEGACY_CREDENTIAL_STORAGE_KEY);
        }
        updateRegenerateButtonsAvailability();
    } catch (error) {
        // Storage may be disabled; ignore politely.
    }
}

function persistCredential(value, shouldRemember) {
    try {
        if (shouldRemember && value) {
            localStorage.setItem(CREDENTIAL_STORAGE_KEY, value);
            localStorage.removeItem(LEGACY_CREDENTIAL_STORAGE_KEY);
        } else {
            localStorage.removeItem(CREDENTIAL_STORAGE_KEY);
        }
    } catch (error) {
        // Best effort only.
    }
}

function clearFlashcardWidget() {
    flashcardState.cards = [];
    flashcardState.index = 0;
    flashcardState.flipped = false;
    resetFlashcardRunState();
    if (flashcardFront) flashcardFront.textContent = '';
    if (flashcardBack) flashcardBack.textContent = '';
    if (flashcardCounter) flashcardCounter.textContent = '0 / 0';
    if (flashcardTags) flashcardTags.innerHTML = '';
    if (flashcardCard) flashcardCard.dataset.flipped = 'false';
    updateRegenerateButtonsAvailability();
    updateFlashcardWidgetVisibility();
}

function clearQuizWidget() {
    clearQuizAutoAdvance();
    quizState.baseQuestions = [];
    quizState.questions = [];
    quizState.index = 0;
    quizState.score = 0;
    quizState.answered = false;
    quizState.roundActive = false;
    quizState.answeredCount = 0;
    resetQuizRunState();
    updateQuizComfortIndicator();
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
    updateQuizScoreboard();
    if (quizFeedback) {
        quizFeedback.textContent = '';
    }
    if (quizRestartButton) {
        quizRestartButton.disabled = true;
    }
    if (quizStartButton) {
        quizStartButton.disabled = true;
    }
    if (quizStopButton) {
        quizStopButton.disabled = true;
    }
    updateQuizPlaceholderOnMode();
    updateRegenerateButtonsAvailability();
    updateQuizControlAvailability();
    clearBlockJamQuizBridge();
}

function getGenerationNoteValue() {
    if (!generationNoteInput) {
        return '';
    }
    return generationNoteInput.value.trim();
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
        note: getGenerationNoteValue(),
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
    resetQuizRound();
    syncBlockJamWithQuizQuestions(baseQuestions);

    if (quizEmpty) {
        quizEmpty.hidden = true;
    }
    if (quizWidget) {
        quizWidget.hidden = false;
    }
    updateRegenerateButtonsAvailability();
}

function reshuffleQuizQuestions() {
    if (quizState.baseQuestions.length === 0) {
        return;
    }
    resetQuizRound('Klausimai permai\u0161yti! Paspausk "Startuoti" ir t\u0119sk.');
    updateRegenerateButtonsAvailability();
}

async function regenerateQuizQuestions() {
    if (generationBusy) {
        return;
    }
    if (!hasGenerationCredential()) {
        setFlashcardStatus('Pirmiausia atrakink slapta\u017Eod\u017Eiu arba \u012Fvesk OpenAI rakt\u0105 pradiniame ekrane.', 'error');
        showScreen('intro');
        introCredentialInput?.focus();
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
        note: getGenerationNoteValue(),
    };

    const previousFlashcards = flashcardState.cards.slice();
    const previousIndex = flashcardState.index;
    const previousFlipped = flashcardState.flipped;

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
    if (!quizWidget) {
        return;
    }
    if (quizState.baseQuestions.length === 0 || quizState.questions.length === 0) {
        if (quizQuestion) {
            quizQuestion.textContent = quizState.baseQuestions.length === 0 ? '' : 'Pasiruo\u0161usi startui?';
        }
        if (quizOptions) {
            quizOptions.innerHTML = '';
        }
        return;
    }

    const current = quizState.questions[quizState.index];

    if (quizQuestion) {
        quizQuestion.textContent = current.question;
    }
    if (quizState.roundActive && !quizState.answered && quizFeedback) {
        quizFeedback.textContent = '';
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
            if (!quizState.roundActive || quizState.answered) {
                button.disabled = true;
                button.classList.add('quiz-option--disabled');
            }
            button.addEventListener('click', () => handleQuizOptionSelect(index));
            quizOptions.appendChild(button);
        });
    }
}

function handleQuizOptionSelect(optionIndex) {
    if (!quizOptions || quizState.questions.length === 0 || quizState.answered || !quizState.roundActive) {
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
    quizState.answeredCount += 1;
    updateQuizScoreboard();
    if (quizState.roundActive) {
        clearQuizAutoAdvance();
        quizState.autoAdvanceId = setTimeout(() => {
            quizState.autoAdvanceId = null;
            advanceQuizQuestion();
        }, QUIZ_AUTO_ADVANCE_DELAY_MS);
    }
}

introForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const rawCredential = introCredentialInput?.value ?? '';
    const cleanedCredential = sanitiseCredentialInput(rawCredential);

    if (introCredentialInput && rawCredential !== cleanedCredential) {
        introCredentialInput.value = cleanedCredential;
    }

    if (!cleanedCredential) {
        introCredentialInput?.focus();
        return;
    }

    const normalised = cleanedCredential.toLowerCase();
    const isPasscode = normalised === PASSCODE.toLowerCase();
    const isLikelyApiKey = /^sk-[a-zA-Z0-9]{20,}$/.test(cleanedCredential);

    if (!isPasscode && !isLikelyApiKey) {
        introCredentialInput?.setCustomValidity(
            'Slapta\u017Eodis neatpa\u017Eintas. \u012Evesk teising\u0105 slapta\u017Eod\u012F arba OpenAI API rakt\u0105.'
        );
        introCredentialInput?.reportValidity();
        return;
    }

    if (introCredentialInput) {
        introCredentialInput.setCustomValidity('');
    }

    state.name = 'Emilija';
    const storedCredential = isPasscode ? PASSCODE : cleanedCredential;
    state.activeCredential = storedCredential;
    state.apiKey = isPasscode ? '' : cleanedCredential;
    persistCredential(
        storedCredential,
        introRememberCredentialCheckbox ? introRememberCredentialCheckbox.checked : false
    );
    updateRegenerateButtonsAvailability();
    updateGreetingNames();
    scheduleSplashHide(600);
    showScreen('tasks');
    autoFocusTimetableOnToday();
});

introToggleKeyBtn?.addEventListener('click', () => {
    if (!introCredentialInput) return;
    const reveal = introCredentialInput.type === 'password';
    introCredentialInput.type = reveal ? 'text' : 'password';
    introToggleKeyBtn.textContent = reveal ? 'Sl\u0117pti' : 'Rodyti';
    introToggleKeyBtn.setAttribute('aria-pressed', reveal ? 'true' : 'false');
    introCredentialInput.focus();
});

editSetupBtn?.addEventListener('click', () => {
    if (nameInput) {
        nameInput.value = state.name;
    }
    if (introCredentialInput) {
        introCredentialInput.value = state.activeCredential || '';
    }
    updateGreetingNames();
    showScreen('intro');
});

if (window.pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.worker.min.js';
}

function blockJamIsReady() {
    return Boolean(blockJamBoard && blockJamPieces);
}

function createBlockJamBoardMatrix() {
    return Array.from({ length: BLOCKJAM_BOARD_SIZE }, () => Array(BLOCKJAM_BOARD_SIZE).fill(null));
}

function buildBlockJamBoardElements() {
    if (!blockJamBoard || blockJamCells.length) {
        return;
    }
    blockJamBoard.innerHTML = '';
    for (let row = 0; row < BLOCKJAM_BOARD_SIZE; row += 1) {
        const rowCells = [];
        for (let col = 0; col < BLOCKJAM_BOARD_SIZE; col += 1) {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'blockjam-cell';
            cell.dataset.row = String(row);
            cell.dataset.col = String(col);
            cell.setAttribute('aria-label', formatBlockJamCellLabel(row, col));
            blockJamBoard.appendChild(cell);
            rowCells.push(cell);
        }
        blockJamCells.push(rowCells);
    }
}

function formatBlockJamCellLabel(row, col, colorKey) {
    const position = (row + 1) + ' eilut\u0117je, ' + (col + 1) + ' stulpelyje';
    if (colorKey && BLOCKJAM_CANDY_LABELS[colorKey]) {
        return BLOCKJAM_CANDY_LABELS[colorKey] + ' ' + position;
    }
    return 'Tu\u0161\u010Dia vieta ' + position;
}

function renderBlockJamBoard() {
    if (!blockJamIsReady()) {
        return;
    }
    for (let row = 0; row < BLOCKJAM_BOARD_SIZE; row += 1) {
        for (let col = 0; col < BLOCKJAM_BOARD_SIZE; col += 1) {
            const state = blockJamState.board[row]?.[col];
            paintBlockJamCell(row, col, state);
        }
    }
}

function paintBlockJamCell(row, col, cellState) {
    const cell = blockJamCells[row]?.[col];
    if (!cell) {
        return;
    }
    removeBlockJamCellColor(cell);
    if (cellState && cellState.color) {
        cell.classList.add('blockjam-cell--filled', 'blockjam-cell--' + cellState.color);
        cell.setAttribute('aria-label', formatBlockJamCellLabel(row, col, cellState.color));
    } else {
        cell.setAttribute('aria-label', formatBlockJamCellLabel(row, col));
    }
}

function removeBlockJamCellColor(cell) {
    cell.classList.remove('blockjam-cell--filled', 'blockjam-cell--clearing');
    BLOCKJAM_COLOR_KEYS.forEach((colorKey) => {
        cell.classList.remove('blockjam-cell--' + colorKey);
    });
}

function clearBlockJamGhost() {
    if (!Array.isArray(blockJamState.ghostCells)) {
        blockJamState.ghostCells = [];
    }
    blockJamState.ghostCells.forEach(({ row, col }) => {
        const cell = blockJamCells[row]?.[col];
        if (cell) {
            cell.classList.remove('blockjam-cell--ghost-valid', 'blockjam-cell--ghost-invalid');
        }
    });
    blockJamState.ghostCells = [];
    blockJamState.ghostSignature = null;
}

function blockJamCellFromEvent(event) {
    if (!event) {
        return null;
    }
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
        return null;
    }
    if (!blockJamBoard?.contains(target)) {
        return null;
    }
    return target.closest('.blockjam-cell');
}

function handleBlockJamBoardHover(event) {
    const cell = blockJamCellFromEvent(event);
    if (!cell) {
        return;
    }
    const row = Number.parseInt(cell.dataset.row || '', 10);
    const col = Number.parseInt(cell.dataset.col || '', 10);
    if (!Number.isFinite(row) || !Number.isFinite(col)) {
        return;
    }
    blockJamState.latestHover = { row, col };
    updateBlockJamGhost(row, col);
}

function handleBlockJamBoardLeave(event) {
    if (event?.type === 'focusout') {
        const next = event.relatedTarget;
        if (next && blockJamBoard?.contains(next)) {
            return;
        }
    }
    blockJamState.latestHover = null;
    clearBlockJamGhost();
}

function handleBlockJamBoardClick(event) {
    if (!blockJamHasQuiz()) {
        updateBlockJamStatus('Sukurk PDF test\u0105 ir tada gal\u0117si d\u0117lioti saldaini\u0173 blokelius.', 'warning');
        return;
    }
    if (blockJamState.isGameOver) {
        return;
    }
    const cell = blockJamCellFromEvent(event);
    if (!cell) {
        return;
    }
    const row = Number.parseInt(cell.dataset.row || '', 10);
    const col = Number.parseInt(cell.dataset.col || '', 10);
    if (!Number.isFinite(row) || !Number.isFinite(col)) {
        return;
    }
    placeBlockJamPiece(row, col);
}

function updateBlockJamQuizEmptyState(visible, message) {
    if (!blockJamQuizEmpty) return;
    blockJamQuizEmpty.hidden = !visible;
    if (message) {
        blockJamQuizEmpty.textContent = message;
    }
}

function getActiveBlockJamPiece() {
    if (blockJamState.selectedIndex === null) {
        return null;
    }
    const piece = blockJamState.queue[blockJamState.selectedIndex];
    if (!piece || piece.used) {
        return null;
    }
    return piece;
}

function updateBlockJamQuestionFeedback(message, mood = null) {
    if (!blockJamQuestionFeedback) return;
    blockJamQuestionFeedback.textContent = message || '';
    blockJamQuestionFeedback.classList.remove(
        'blockjam-question__feedback--success',
        'blockjam-question__feedback--warning'
    );
    if (mood === 'success') {
        blockJamQuestionFeedback.classList.add('blockjam-question__feedback--success');
    } else if (mood === 'warning') {
        blockJamQuestionFeedback.classList.add('blockjam-question__feedback--warning');
    }
}

function updateBlockJamQuestionProgress() {
    if (!blockJamQuestionProgress) return;
    if (!blockJamHasQuiz()) {
        blockJamQuestionProgress.textContent = '';
        return;
    }
    const total = blockJamState.questionPool.length;
    const placed = blockJamState.questionPool.filter((question) => question.placed).length;
    blockJamQuestionProgress.textContent = `${placed}/${total}`;
}

function renderBlockJamQuestion(piece) {
    if (!blockJamQuestionShell || !blockJamQuestionOptions) {
        return;
    }
    if (!piece || !piece.question) {
        blockJamQuestionShell.hidden = true;
        if (blockJamHasQuiz()) {
            updateBlockJamQuizEmptyState(false);
        }
        updateBlockJamQuestionFeedback('');
        return;
    }
    updateBlockJamQuizEmptyState(false);
    blockJamQuestionShell.hidden = false;
    if (blockJamQuestionLabel) {
        blockJamQuestionLabel.textContent = piece.question.label || 'Klausimas';
    }
    if (blockJamQuestionText) {
        blockJamQuestionText.textContent = piece.question.question;
    }
    blockJamQuestionOptions.innerHTML = '';
    piece.question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'blockjam-answer';
        button.dataset.index = String(index);
        const badge = document.createElement('span');
        badge.className = 'blockjam-answer__badge';
        badge.textContent = String.fromCharCode(65 + index);
        const text = document.createElement('span');
        text.textContent = option;
        button.append(badge, text);
        if (piece.question.answered) {
            button.disabled = true;
            if (index === piece.question.correctIndex) {
                button.classList.add('blockjam-answer--correct');
            } else {
                button.classList.add('blockjam-answer--wrong');
            }
        }
        blockJamQuestionOptions.appendChild(button);
    });
    if (piece.question.answered) {
        updateBlockJamQuestionFeedback('Teisingai! Dabar pad\u0117k blok\u0105 lenteleje.', 'success');
    } else {
        updateBlockJamQuestionFeedback('Pasirink atsakym\u0105 ir atrakink saldaini\u0173 blok\u0105.');
    }
}

function handleBlockJamAnswerSelection(optionIndex) {
    if (!blockJamHasQuiz()) {
        return;
    }
    const piece = getActiveBlockJamPiece();
    if (!piece || !piece.question || piece.question.answered) {
        return;
    }
    if (optionIndex === piece.question.correctIndex) {
        piece.question.answered = true;
        piece.unlocked = true;
        blockJamState.answeredCount = (blockJamState.answeredCount || 0) + 1;
        updateBlockJamStatus('Teisingai! U\u017Ed\u0117k blok\u0105 ant lentos.', 'success');
        updateBlockJamQuestionFeedback('Teisingas atsakymas! Pasirink viet\u0105 lenteleje.', 'success');
        renderBlockJamPieces();
        updateBlockJamHud();
        updateBlockJamQuestionProgress();
        renderBlockJamQuestion(piece);
    } else {
        updateBlockJamQuestionFeedback('Ups! Pabandyk kit\u0105 atsakym\u0105.', 'warning');
        flashBlockJamPieceWarning(blockJamState.selectedIndex);
    }
}

function selectBlockJamPiece(index) {
    if (!Array.isArray(blockJamState.queue) || index < 0 || index >= blockJamState.queue.length) {
        blockJamState.selectedIndex = null;
    } else {
        const candidate = blockJamState.queue[index];
        blockJamState.selectedIndex = candidate && !candidate.used ? index : null;
    }
    clearBlockJamGhost();
    renderBlockJamPieces();
    updateBlockJamHud();
    const piece = getActiveBlockJamPiece();
    if (!piece) {
        updateBlockJamStatus(BLOCKJAM_DEFAULT_STATUS);
        renderBlockJamQuestion(null);
        return;
    }
    if (piece.question && !piece.question.answered) {
        updateBlockJamStatus('Atrakinam: ' + (piece.question.label || piece.name), 'info');
        renderBlockJamQuestion(piece);
    } else {
        updateBlockJamStatus('Pasirinkta: ' + piece.name + '. Pad\u0117k j\u012f lenteleje.');
        renderBlockJamQuestion(null);
        if (blockJamState.latestHover) {
            updateBlockJamGhost(blockJamState.latestHover.row, blockJamState.latestHover.col);
        }
    }
}

function rotateBlockJamPiece(index, direction = 1) {
    if (typeof index !== 'number' || index < 0 || index >= blockJamState.queue.length) {
        return;
    }
    const piece = blockJamState.queue[index];
    if (!piece || piece.used) {
        return;
    }
    if (piece.question && !piece.question.answered) {
        return;
    }
    const turns = ((direction % 4) + 4) % 4;
    if (turns === 0) {
        return;
    }
    piece.cells = rotateBlockJamCells(piece.cells, turns);
    const size = deriveBlockJamPieceSize(piece.cells);
    piece.width = size.width;
    piece.height = size.height;
    renderBlockJamPieces();
    if (blockJamState.selectedIndex === index && blockJamState.latestHover) {
        updateBlockJamGhost(blockJamState.latestHover.row, blockJamState.latestHover.col);
    }
}

function rotateBlockJamCells(cells, turns = 1) {
    if (!Array.isArray(cells) || cells.length === 0) {
        return [];
    }
    let rotated = normaliseBlockJamCells(cells);
    const safeTurns = ((turns % 4) + 4) % 4;
    for (let i = 0; i < safeTurns; i += 1) {
        const height = Math.max(...rotated.map(([, y]) => y)) + 1;
        rotated = rotated.map(([x, y]) => [height - 1 - y, x]);
        rotated = normaliseBlockJamCells(rotated);
    }
    return rotated;
}

function normaliseBlockJamCells(cells) {
    if (!Array.isArray(cells) || cells.length === 0) {
        return [];
    }
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    cells.forEach(([x, y]) => {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
    });
    return cells.map(([x, y]) => [x - minX, y - minY]);
}

function deriveBlockJamPieceSize(cells) {
    if (!Array.isArray(cells) || cells.length === 0) {
        return { width: 0, height: 0 };
    }
    const maxX = Math.max(...cells.map(([x]) => x));
    const maxY = Math.max(...cells.map(([, y]) => y));
    return {
        width: maxX + 1,
        height: maxY + 1,
    };
}

function getBlockJamPlacement(piece, startRow, startCol) {
    if (!piece) {
        return { valid: false, cells: [] };
    }
    const placementCells = piece.cells.map(([x, y]) => ({
        row: startRow + y,
        col: startCol + x,
    }));
    const withinBounds = placementCells.every(
        ({ row, col }) =>
            row >= 0 && row < BLOCKJAM_BOARD_SIZE && col >= 0 && col < BLOCKJAM_BOARD_SIZE
    );
    if (!withinBounds) {
        return { valid: false, cells: placementCells };
    }
    const fits = placementCells.every(({ row, col }) => !blockJamState.board[row][col]);
    return { valid: fits, cells: placementCells };
}

function canPlaceBlockJamPiece(piece, row, col) {
    const placement = getBlockJamPlacement(piece, row, col);
    return placement.valid;
}

function blockJamPieceHasValidMove(piece) {
    if (!piece || piece.used) {
        return false;
    }
    const fallbackSize = deriveBlockJamPieceSize(piece.cells);
    const pieceHeight = Number.isFinite(piece.height) ? piece.height : fallbackSize.height;
    const pieceWidth = Number.isFinite(piece.width) ? piece.width : fallbackSize.width;
    const rowLimit = BLOCKJAM_BOARD_SIZE - pieceHeight;
    const colLimit = BLOCKJAM_BOARD_SIZE - pieceWidth;
    if (rowLimit < 0 || colLimit < 0) {
        return false;
    }
    for (let row = 0; row <= rowLimit; row += 1) {
        for (let col = 0; col <= colLimit; col += 1) {
            if (canPlaceBlockJamPiece(piece, row, col)) {
                return true;
            }
        }
    }
    return false;
}

function updateBlockJamGhost(row, col) {
    if (blockJamState.selectedIndex === null) {
        clearBlockJamGhost();
        return;
    }
    const piece = blockJamState.queue[blockJamState.selectedIndex];
    if (!piece || piece.used) {
        clearBlockJamGhost();
        return;
    }
    const placement = getBlockJamPlacement(piece, row, col);
    const validClass = placement.valid ? 'blockjam-cell--ghost-valid' : 'blockjam-cell--ghost-invalid';
    const nextGhostCells = [];
    placement.cells.forEach(({ row: r, col: c }) => {
        if (r < 0 || r >= BLOCKJAM_BOARD_SIZE || c < 0 || c >= BLOCKJAM_BOARD_SIZE) {
            return;
        }
        const cell = blockJamCells[r]?.[c];
        if (!cell) {
            return;
        }
        nextGhostCells.push({ row: r, col: c });
    });
    if (nextGhostCells.length === 0) {
        clearBlockJamGhost();
        return;
    }
    const pieceKey = piece?.id || 'piece-' + blockJamState.selectedIndex;
    const coordsKey = nextGhostCells.map(({ row: r, col: c }) => `${r}-${c}`).join('|');
    const nextSignature = [pieceKey, placement.valid ? '1' : '0', coordsKey].join(':');
    if (blockJamState.ghostSignature === nextSignature) {
        return;
    }
    clearBlockJamGhost();
    nextGhostCells.forEach(({ row: r, col: c }) => {
        const cell = blockJamCells[r]?.[c];
        if (!cell) {
            return;
        }
        cell.classList.add(validClass);
    });
    blockJamState.ghostCells = nextGhostCells;
    blockJamState.ghostSignature = nextSignature;
}

function flashBlockJamPieceWarning(index) {
    if (!blockJamPieces) {
        return;
    }
    const selector = '.blockjam-piece[data-index="' + index + '"]';
    const card = blockJamPieces.querySelector(selector);
    if (!card) {
        return;
    }
    card.classList.add('blockjam-piece--shake');
    const existingTimer = blockJamDangerTimers.get(card);
    if (existingTimer) {
        clearTimeout(existingTimer);
    }
    const timeoutId = setTimeout(() => {
        card.classList.remove('blockjam-piece--shake');
        blockJamDangerTimers.delete(card);
    }, 420);
    blockJamDangerTimers.set(card, timeoutId);
}

function placeBlockJamPiece(row, col) {
    if (blockJamState.selectedIndex === null) {
        updateBlockJamStatus('Pirma pasirink blok\u0105 apa\u010dioje.', 'warning');
        return;
    }
    const piece = blockJamState.queue[blockJamState.selectedIndex];
    if (!piece || piece.used) {
        updateBlockJamStatus('Tas saldainis jau panaudotas. Pasirink kit\u0105.', 'warning');
        blockJamState.selectedIndex = null;
        renderBlockJamPieces();
        return;
    }
    if (piece.question && !piece.question.answered) {
        updateBlockJamStatus('Pirmiausia atrakink blok\u0105 atsakydama klausim\u0105.', 'warning');
        renderBlockJamQuestion(piece);
        return;
    }
    const placement = getBlockJamPlacement(piece, row, col);
    if (!placement.valid) {
        flashBlockJamPieceWarning(blockJamState.selectedIndex);
        updateBlockJamStatus('Ten netelpa. Pam\u0117gink kit\u0105 viet\u0105!', 'warning');
        return;
    }
    applyBlockJamPlacement(piece, placement.cells);
}

function applyBlockJamPlacement(piece, placementCells) {
    placementCells.forEach(({ row, col }) => {
        blockJamState.board[row][col] = { color: piece.color };
        const cell = blockJamCells[row]?.[col];
        if (cell) {
            cell.classList.remove('blockjam-cell--ghost-valid', 'blockjam-cell--ghost-invalid');
            cell.classList.add('blockjam-cell--filled', 'blockjam-cell--' + piece.color, 'blockjam-cell--new');
            cell.setAttribute('aria-label', formatBlockJamCellLabel(row, col, piece.color));
            setTimeout(() => {
                cell.classList.remove('blockjam-cell--new');
            }, 420);
        }
    });
    piece.used = true;
    if (piece.question) {
        piece.question.placed = true;
    }
    blockJamState.selectedIndex = null;
    clearBlockJamGhost();
    const matchClears = clearBlockJamMatches(placementCells);
    const lineClears = clearCompletedBlockJamLines();
    const cleared = mergeBlockJamClearStats(lineClears, matchClears);
    updateBlockJamScore(piece.cells.length, cleared);
    refillBlockJamQueue();
    renderBlockJamPieces();
    updateBlockJamHud();
    renderBlockJamQuestion(null);
    updateBlockJamQuestionProgress();
    checkBlockJamForGameOver();
    const clearedLines = (cleared.rows || 0) + (cleared.cols || 0);
    const clearedClusters = cleared.clusters || 0;
    if (clearedClusters > 0 && clearedLines > 0) {
        updateBlockJamStatus('Saldi lavina! ' + clearedClusters + ' grup\u0117s ir ' + clearedLines + ' linijos i\u0161nyko.', 'success');
    } else if (clearedClusters > 0) {
        updateBlockJamStatus('Palietus susilyd\u0117 ' + clearedClusters + ' saldaini\u0173 grup\u0117s!', 'success');
    } else if (clearedLines > 0) {
        updateBlockJamStatus('Nuostabu! I\u0161valytos ' + clearedLines + ' linijos.', 'success');
    } else {
        updateBlockJamStatus('Sutalpinta ' + piece.cells.length + ' saldaini\u0173.');
    }
}

function findBlockJamMatches() {
    const visited = Array.from({ length: BLOCKJAM_BOARD_SIZE }, () => Array(BLOCKJAM_BOARD_SIZE).fill(false));
    const matches = [];
    for (let row = 0; row < BLOCKJAM_BOARD_SIZE; row += 1) {
        for (let col = 0; col < BLOCKJAM_BOARD_SIZE; col += 1) {
            const cellState = blockJamState.board[row]?.[col];
            if (!cellState || visited[row][col]) {
                continue;
            }
            const stack = [{ row, col }];
            const cluster = [];
            visited[row][col] = true;
            while (stack.length) {
                const current = stack.pop();
                cluster.push(current);
                const neighbours = [
                    { row: current.row - 1, col: current.col },
                    { row: current.row + 1, col: current.col },
                    { row: current.row, col: current.col - 1 },
                    { row: current.row, col: current.col + 1 },
                ];
                neighbours.forEach(({ row: nRow, col: nCol }) => {
                    if (nRow < 0 || nRow >= BLOCKJAM_BOARD_SIZE || nCol < 0 || nCol >= BLOCKJAM_BOARD_SIZE) {
                        return;
                    }
                    if (visited[nRow][nCol]) {
                        return;
                    }
                    const neighbourState = blockJamState.board[nRow]?.[nCol];
                    if (neighbourState && neighbourState.color === cellState.color) {
                        visited[nRow][nCol] = true;
                        stack.push({ row: nRow, col: nCol });
                    }
                });
            }
            if (cluster.length >= BLOCKJAM_MATCH_MIN) {
                matches.push({
                    color: cellState.color,
                    cells: cluster,
                });
            }
        }
    }
    return matches;
}

function clearBlockJamMatches(recentPlacement = []) {
    const matches = findBlockJamMatches();
    if (!matches.length) {
        return { clusters: 0, cells: 0 };
    }
    const recentSet = new Set(
        Array.isArray(recentPlacement)
            ? recentPlacement.map(({ row, col }) => `${row}-${col}`)
            : []
    );
    const eligibleMatches =
        recentSet.size === 0
            ? matches
            : matches.filter((match) => {
                  // Skip clearing clusters made only from the freshly placed piece.
                  const allFromRecent = match.cells.every(({ row, col }) => recentSet.has(`${row}-${col}`));
                  return !allFromRecent;
              });
    if (!eligibleMatches.length) {
        return { clusters: 0, cells: 0 };
    }
    const toClear = [];
    eligibleMatches.forEach((match) => {
        match.cells.forEach(({ row, col }) => {
            toClear.push({ row, col });
            blockJamState.board[row][col] = null;
            const cell = blockJamCells[row]?.[col];
            if (cell) {
                cell.classList.add('blockjam-cell--clearing');
            }
        });
    });
    setTimeout(() => {
        toClear.forEach(({ row, col }) => {
            const cell = blockJamCells[row]?.[col];
            if (cell) {
                removeBlockJamCellColor(cell);
                cell.classList.remove('blockjam-cell--clearing');
                cell.setAttribute('aria-label', formatBlockJamCellLabel(row, col));
            }
        });
    }, BLOCKJAM_CLEAR_DELAY_MS);
    return { clusters: eligibleMatches.length, cells: toClear.length };
}

function mergeBlockJamClearStats(lineInfo = {}, matchInfo = {}) {
    return {
        rows: lineInfo.rows || 0,
        cols: lineInfo.cols || 0,
        cells: (lineInfo.cells || 0) + (matchInfo.cells || 0),
        clusters: matchInfo.clusters || 0,
    };
}

function clearCompletedBlockJamLines() {
    const rowsToClear = [];
    const colsToClear = [];
    for (let row = 0; row < BLOCKJAM_BOARD_SIZE; row += 1) {
        if (blockJamState.board[row].every(Boolean)) {
            rowsToClear.push(row);
        }
    }
    for (let col = 0; col < BLOCKJAM_BOARD_SIZE; col += 1) {
        let filled = true;
        for (let row = 0; row < BLOCKJAM_BOARD_SIZE; row += 1) {
            if (!blockJamState.board[row][col]) {
                filled = false;
                break;
            }
        }
        if (filled) {
            colsToClear.push(col);
        }
    }
    if (!rowsToClear.length && !colsToClear.length) {
        return { rows: 0, cols: 0, cells: 0 };
    }
    const toClear = [];
    rowsToClear.forEach((row) => {
        for (let col = 0; col < BLOCKJAM_BOARD_SIZE; col += 1) {
            toClear.push({ row, col });
        }
    });
    colsToClear.forEach((col) => {
        for (let row = 0; row < BLOCKJAM_BOARD_SIZE; row += 1) {
            if (!toClear.some((cell) => cell.row === row && cell.col === col)) {
                toClear.push({ row, col });
            }
        }
    });
    toClear.forEach(({ row, col }) => {
        blockJamState.board[row][col] = null;
        const cell = blockJamCells[row]?.[col];
        if (cell) {
            cell.classList.add('blockjam-cell--clearing');
        }
    });
    setTimeout(() => {
        toClear.forEach(({ row, col }) => {
            const cell = blockJamCells[row]?.[col];
            if (cell) {
                removeBlockJamCellColor(cell);
                cell.classList.remove('blockjam-cell--clearing');
                cell.setAttribute('aria-label', formatBlockJamCellLabel(row, col));
            }
        });
    }, BLOCKJAM_CLEAR_DELAY_MS);
    return { rows: rowsToClear.length, cols: colsToClear.length, cells: toClear.length };
}

function updateBlockJamScore(placedCount, clearedInfo) {
    const clearedLines = (clearedInfo?.rows || 0) + (clearedInfo?.cols || 0);
    const clearedClusters = clearedInfo?.clusters || 0;
    if (clearedLines > 0 || clearedClusters > 0) {
        blockJamState.combo = Math.min(5, blockJamState.combo + 1);
    } else {
        blockJamState.combo = 1;
    }
    const clearedCells = clearedInfo?.cells || 0;
    const lineBonus = clearedLines * 12;
    const clusterBonus = clearedClusters * 8;
    const gainBase = placedCount + clearedCells + lineBonus + clusterBonus;
    const gain = Math.max(1, Math.round(gainBase * blockJamState.combo));
    blockJamState.score += gain;
    if (!blockJamState.demoActive && blockJamState.score >= blockJamState.nextRewardAt) {
        awardReward('blockjam');
        blockJamState.nextRewardAt += 150;
    }
}

function updateBlockJamHud() {
    if (blockJamScoreValue) {
        blockJamScoreValue.textContent = String(blockJamState.score);
    }
    if (blockJamComboValue) {
        blockJamComboValue.textContent = 'x' + Math.max(1, blockJamState.combo);
    }
    if (blockJamMovesValue) {
        const remaining = blockJamHasQuiz()
            ? blockJamState.questionPool.filter((question) => !question.placed).length
            : blockJamState.queue.filter((piece) => !piece.used).length;
        blockJamMovesValue.textContent = String(Math.max(0, remaining));
    }
    if (blockJamRotateButton) {
        const activePiece = getActiveBlockJamPiece();
        const canRotate =
            !!activePiece &&
            !blockJamState.isGameOver &&
            (!activePiece.question || activePiece.question.answered);
        blockJamRotateButton.disabled = !canRotate;
    }
}

function updateBlockJamStatus(message, mood = 'info') {
    if (!blockJamStatusText) {
        return;
    }
    const text = message && message.length ? message : blockJamStatusDefaultText;
    blockJamStatusText.textContent = text;
    blockJamStatusText.classList.remove('blockjam__status-text--success', 'blockjam__status-text--warning');
    if (mood === 'success') {
        blockJamStatusText.classList.add('blockjam__status-text--success');
    } else if (mood === 'warning') {
        blockJamStatusText.classList.add('blockjam__status-text--warning');
    }
}

function updateBlockJamHint(message) {
    if (!blockJamHintText) {
        return;
    }
    blockJamHintText.textContent = message && message.length ? message : blockJamHintDefaultText;
}

function renderBlockJamPieces() {
    if (!blockJamPieces) {
        return;
    }
    blockJamPieces.innerHTML = '';
    if (blockJamState.queue.length === 0) {
        const placeholder = document.createElement('p');
        placeholder.className = 'blockjam-quiz__empty';
        placeholder.textContent = blockJamHasQuiz()
            ? 'Atrakink nauj\u0105 klausim\u0105, kad atsirast\u0173 blok\u0173.'
            : 'Sukurk PDF test\u0105, kad saldaini\u0173 blokai atsirast\u0173 \u010dia.';
        blockJamPieces.appendChild(placeholder);
        return;
    }
    blockJamState.queue.forEach((piece, index) => {
        const card = document.createElement('div');
        card.className = 'blockjam-piece';
        card.dataset.index = String(index);
        card.setAttribute('role', 'listitem');
        if (piece.used) {
            card.classList.add('blockjam-piece--disabled');
        }
        if (!piece.used && blockJamState.selectedIndex === index) {
            card.classList.add('blockjam-piece--selected');
        }
        const hasSlot = blockJamPieceHasValidMove(piece);
        if (!piece.used && !hasSlot) {
            card.classList.add('blockjam-piece--danger');
        }
        card.classList.remove('blockjam-piece--locked', 'blockjam-piece--unlocked');
        if (piece.question) {
            card.dataset.lockLabel = piece.question.answered ? 'Atrakinta' : 'Testas';
            card.classList.add(piece.question.answered ? 'blockjam-piece--unlocked' : 'blockjam-piece--locked');
        } else {
            delete card.dataset.lockLabel;
        }
        const bodyButton = document.createElement('button');
        bodyButton.type = 'button';
        bodyButton.className = 'blockjam-piece__body';
        bodyButton.dataset.index = String(index);
        bodyButton.dataset.action = 'select';
        bodyButton.disabled = piece.used;
        bodyButton.setAttribute(
            'aria-label',
            piece.used ? piece.name + ' jau i\u0161naudota.' : 'Pasirink ' + piece.name
        );
        const grid = document.createElement('div');
        grid.className = 'blockjam-piece__grid';
        grid.style.setProperty('--cols', String(piece.width));
        piece.cells.forEach(([x, y]) => {
            const cell = document.createElement('span');
            cell.className = 'blockjam-piece__cell blockjam-piece__cell--' + piece.color;
            cell.style.gridColumnStart = String(x + 1);
            cell.style.gridRowStart = String(y + 1);
            grid.appendChild(cell);
        });
        bodyButton.appendChild(grid);
        card.appendChild(bodyButton);

        const footer = document.createElement('div');
        footer.className = 'blockjam-piece__footer';
        const label = document.createElement('span');
        label.className = 'blockjam-piece__label';
        label.textContent = piece.question?.label || piece.name;
        footer.appendChild(label);
        if (piece.question) {
            const badge = document.createElement('span');
            badge.className = 'blockjam-piece__badge';
            badge.textContent = piece.question.answered ? 'Paruo\u0161ta' : 'Klausimas';
            footer.appendChild(badge);
        }

        const controls = document.createElement('div');
        controls.className = 'blockjam-piece__controls';
        const rotateBtn = document.createElement('button');
        rotateBtn.type = 'button';
        rotateBtn.className = 'blockjam-piece__rotate';
        rotateBtn.dataset.index = String(index);
        rotateBtn.dataset.action = 'rotate';
        rotateBtn.disabled = piece.used || (piece.question && !piece.question.answered);
        rotateBtn.setAttribute('aria-label', 'Pasukti ' + piece.name);
        rotateBtn.textContent = '\u21bb';
        controls.appendChild(rotateBtn);
        footer.appendChild(controls);
        card.appendChild(footer);
        blockJamPieces.appendChild(card);
    });
}

function handleBlockJamPieceClick(event) {
    const rotateBtn = event.target instanceof Element ? event.target.closest('.blockjam-piece__rotate') : null;
    if (rotateBtn) {
        const index = Number.parseInt(rotateBtn.dataset.index || '', 10);
        if (Number.isFinite(index)) {
            rotateBlockJamPiece(index, 1);
        }
        return;
    }
    const selectBtn = event.target instanceof Element ? event.target.closest('.blockjam-piece__body') : null;
    if (selectBtn) {
        const index = Number.parseInt(selectBtn.dataset.index || '', 10);
        if (Number.isFinite(index)) {
            selectBlockJamPiece(index);
        }
    }
}

function blockJamIsVisible() {
    return Boolean(blockJamCard && !blockJamCard.hidden && blockJamCard.offsetParent !== null);
}

function handleBlockJamHotkeys(event) {
    if (!blockJamIsVisible()) {
        return;
    }
    const target = event.target;
    if (
        target &&
        (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)
    ) {
        return;
    }
    if ((event.key === 'r' || event.key === 'R') && blockJamState.selectedIndex !== null) {
        event.preventDefault();
        rotateBlockJamPiece(blockJamState.selectedIndex, 1);
    }
    if (event.key === 'Escape' && blockJamState.selectedIndex !== null) {
        event.preventDefault();
        blockJamState.selectedIndex = null;
        clearBlockJamGhost();
        renderBlockJamPieces();
        updateBlockJamHud();
        updateBlockJamStatus(BLOCKJAM_DEFAULT_STATUS);
        renderBlockJamQuestion(null);
    }
}

function syncBlockJamWithQuizQuestions(baseQuestions, { isDemo = false } = {}) {
    if (!blockJamIsReady()) {
        return;
    }
    const decorated = baseQuestions.map((question, index) => ({
        ...question,
        id: `blockjam-${index + 1}`,
        label: `Klausimas #${index + 1}`,
        assigned: false,
        answered: false,
        placed: false,
    }));
    blockJamState.questionPool = decorated;
    blockJamState.hasQuiz = !isDemo && decorated.length > 0;
    blockJamState.demoActive = isDemo && decorated.length > 0;
    blockJamState.answeredCount = 0;
    resetBlockJamGame({ resetQuestions: true, announce: false });
    if (!blockJamHasQuiz()) {
        updateBlockJamQuizEmptyState(true, 'Sukurk PDF test\u0105 ir saldiniai klausimai atsiras \u010dia.');
        setBlockJamWaitingState(true);
        updateBlockJamStatus(BLOCKJAM_DEFAULT_STATUS);
        updateBlockJamHint(blockJamHintDefaultText);
        return;
    }
    setBlockJamWaitingState(false);
    refillBlockJamQueue(true);
    renderBlockJamPieces();
    updateBlockJamHud();
    updateBlockJamQuestionProgress();
    renderBlockJamQuestion(null);
    const statusMessage = isDemo
        ? 'Demo r\u0117\u017eimas: atsakyk \u012f pavyzdinius klausimus ir pad\u0117k blok\u0105.'
        : 'Pasirink blok\u0105, atsakyk klausim\u0105 ir pad\u0117k j\u012f lentoje.';
    const sharedHint = ' Sujunk bent tris tos pa\u010dios spalvos saldainius, kad jie susilydyt\u0173.';
    const hintMessage = isDemo
        ? 'Kai sugeneruosi PDF ABCD test\u0105, demo klausimai bus pakeisti tavo med\u017eiaga.' + sharedHint
        : 'Kiekvienas blokas slepia klausim\u0105 i\u0161 tavo PDF testuko.' + sharedHint;
    updateBlockJamStatus(statusMessage, 'info');
    updateBlockJamHint(hintMessage);
}

function clearBlockJamQuizBridge() {
    blockJamState.questionPool = [];
    blockJamState.queue = [];
    blockJamState.selectedIndex = null;
    blockJamState.hasQuiz = false;
    blockJamState.answeredCount = 0;
    blockJamState.score = 0;
    blockJamState.combo = 1;
    blockJamState.victoryNotified = false;
    updateBlockJamQuizEmptyState(true, 'Sukurk PDF test\u0105 ir saldiniai klausimai atsiras \u010dia.');
    setBlockJamWaitingState(true);
    clearBlockJamGhost();
    renderBlockJamBoard();
    renderBlockJamPieces();
    renderBlockJamQuestion(null);
    updateBlockJamQuestionProgress();
    updateBlockJamHud();
    updateBlockJamStatus(BLOCKJAM_DEFAULT_STATUS);
    updateBlockJamHint(blockJamHintDefaultText);
    loadBlockJamDemoQuiz();
}

function refillBlockJamQueue(force = false) {
    const available = blockJamState.queue.filter((piece) => !piece.used);
    blockJamState.queue = available;
    if (!blockJamHasQuiz()) {
        return;
    }
    const needed = Math.max(0, BLOCKJAM_SET_SIZE - blockJamState.queue.length);
    if (!force && needed === 0) {
        return;
    }
    const candidates = blockJamState.questionPool.filter((question) => !question.assigned && !question.placed);
    candidates.slice(0, needed).forEach((question) => {
        question.assigned = true;
        blockJamState.queue.push(buildRandomBlockJamPiece(question));
    });
}

function buildRandomBlockJamPiece(question = null) {
    const shape = BLOCKJAM_SHAPES[Math.floor(Math.random() * BLOCKJAM_SHAPES.length)];
    const rotation = Math.floor(Math.random() * 4);
    const rotatedCells = rotateBlockJamCells(shape.cells, rotation);
    const size = deriveBlockJamPieceSize(rotatedCells);
    return {
        id: shape.id + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1000),
        name: shape.name,
        color: shape.color,
        cells: rotatedCells,
        width: size.width,
        height: size.height,
        used: false,
        question,
        questionId: question?.id ?? null,
        unlocked: question ? Boolean(question.answered) : true,
    };
}

function resetBlockJamGame(options = {}) {
    if (!blockJamIsReady()) {
        return;
    }
    const resetQuestions = Boolean(options.resetQuestions);
    blockJamState.board = createBlockJamBoardMatrix();
    blockJamState.queue = [];
    blockJamState.selectedIndex = null;
    blockJamState.ghostCells = [];
    blockJamState.latestHover = null;
    blockJamState.isGameOver = false;
    blockJamState.score = 0;
    blockJamState.combo = 1;
    blockJamState.nextRewardAt = 150;
    blockJamState.victoryNotified = false;
    if (resetQuestions) {
        blockJamState.questionPool.forEach((question) => {
            question.assigned = false;
            question.answered = false;
            question.placed = false;
        });
        blockJamState.answeredCount = 0;
    }
    blockJamDangerTimers.forEach((timer) => clearTimeout(timer));
    blockJamDangerTimers.clear();
    clearBlockJamGhost();
    renderBlockJamBoard();
    refillBlockJamQueue(true);
    renderBlockJamPieces();
    renderBlockJamQuestion(null);
    updateBlockJamQuestionProgress();
    updateBlockJamHud();
    updateBlockJamHint(blockJamHintDefaultText);
    blockJamBoard?.classList.remove('blockjam-board--frozen');
    if (options?.announce === false) {
        updateBlockJamStatus(BLOCKJAM_DEFAULT_STATUS);
    } else if (blockJamHasQuiz()) {
        updateBlockJamStatus('Saldaini\u0173 partija prad\u0117ta! Pasirink blok\u0105 ir atsakyk klausim\u0105.');
    } else {
        updateBlockJamStatus(BLOCKJAM_DEFAULT_STATUS);
    }
}

function checkBlockJamForGameOver() {
    if (!blockJamIsReady()) {
        return;
    }
    if (blockJamHasQuiz()) {
        const allPlaced = blockJamState.questionPool.length > 0 && blockJamState.questionPool.every((question) => question.placed);
        if (allPlaced) {
            blockJamState.isGameOver = true;
            blockJamBoard?.classList.add('blockjam-board--frozen');
            updateBlockJamStatus('Visi klausimai \u012Fveikti! Lenta pilna saldumyn\u0173.', 'success');
            updateBlockJamHint('Paspausk "Restartuoti", jei nori pakartoti sald\u0173 testuk\u0105.');
            if (!blockJamState.victoryNotified) {
                awardReward('blockjam');
                blockJamState.victoryNotified = true;
            }
            return;
        }
        const unlockedPieces = blockJamState.queue.filter(
            (piece) => !piece.used && (!piece.question || piece.question.answered)
        );
        const hasMove = unlockedPieces.some((piece) => blockJamPieceHasValidMove(piece));
        const hasPendingQuestions = blockJamState.questionPool.some((question) => !question.answered);
        if (!hasMove && !hasPendingQuestions) {
            blockJamState.isGameOver = true;
            blockJamBoard?.classList.add('blockjam-board--frozen');
            updateBlockJamStatus('Neb\u0117ra vietos! Spausk "Restartuoti" ir gauk nauj\u0105 partij\u0105.', 'warning');
            updateBlockJamHint('Neb\u0117ra \u0117jim\u0173. Restartuok ir tegul saldainiai gr\u012F\u017Eta.');
            return;
        }
        blockJamState.isGameOver = false;
        blockJamBoard?.classList.remove('blockjam-board--frozen');
        if (!hasMove && hasPendingQuestions) {
            updateBlockJamStatus('Atrakink dar vien\u0105 blok\u0105, kad atsirast\u0173 vietos.', 'info');
            updateBlockJamHint('Pasirink kit\u0105 klausim\u0105 ir d\u0117liok nauj\u0105 fig\u016Br\u0105.');
        } else {
            updateBlockJamHint(blockJamHintDefaultText);
        }
        return;
    }
    // Fallback when no quiz is attached.
    const fallbackMove = blockJamState.queue.some((piece) => !piece.used && blockJamPieceHasValidMove(piece));
    blockJamState.isGameOver = !fallbackMove;
    blockJamBoard?.classList.toggle('blockjam-board--frozen', blockJamState.isGameOver);
}

function initialiseBlockJamMode() {
    if (blockJamInitialised || !blockJamIsReady()) {
        return;
    }
    buildBlockJamBoardElements();
    blockJamBoard?.addEventListener('pointerover', handleBlockJamBoardHover);
    blockJamBoard?.addEventListener('pointerleave', handleBlockJamBoardLeave);
    blockJamBoard?.addEventListener('focusin', handleBlockJamBoardHover);
    blockJamBoard?.addEventListener('focusout', handleBlockJamBoardLeave);
    blockJamBoard?.addEventListener('click', handleBlockJamBoardClick);
    blockJamPieces?.addEventListener('click', handleBlockJamPieceClick);
    blockJamResetButton?.addEventListener('click', () => {
        resetBlockJamGame({ resetQuestions: true });
    });
    blockJamRotateButton?.addEventListener('click', () => {
        const activePiece = getActiveBlockJamPiece();
        if (blockJamState.selectedIndex !== null && activePiece && (!activePiece.question || activePiece.question.answered)) {
            rotateBlockJamPiece(blockJamState.selectedIndex, 1);
        }
    });
    document.addEventListener('keydown', handleBlockJamHotkeys);
    resetBlockJamGame({ announce: false });
    setBlockJamWaitingState(true);
    updateBlockJamQuizEmptyState(true, 'Sukurk PDF test\u0105 ir saldiniai klausimai atsiras \u010dia.');
    loadBlockJamDemoQuiz();
    blockJamInitialised = true;
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

flashcardShuffleBtn?.addEventListener('click', () => {
    shuffleFlashcards();
});

blockJamQuestionOptions?.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('.blockjam-answer') : null;
    if (!button) {
        return;
    }
    const optionIndex = Number.parseInt(button.dataset.index || '', 10);
    if (Number.isFinite(optionIndex)) {
        handleBlockJamAnswerSelection(optionIndex);
    }
});

quizStartButton?.addEventListener('click', () => {
    startQuizRound();
});

quizStopButton?.addEventListener('click', () => {
    if (!quizState.roundActive) {
        return;
    }
    endQuizRound('manual');
});

quizRestartButton?.addEventListener('click', () => {
    if (quizState.baseQuestions.length === 0) {
        return;
    }
    resetQuizRound('Viskas paruo\u0161ta naujam bandymui! Paspausk "Startuoti".');
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

    if (!hasGenerationCredential()) {
        setFlashcardStatus('Pirmiausia atrakink slapta\u017Eod\u017Eiu arba \u012Fvesk OpenAI rakt\u0105 pradiniame ekrane.', 'error');
        showScreen('intro');
        introCredentialInput?.focus();
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

    const previousFlashcards = flashcardState.cards.slice();
    const previousIndex = flashcardState.index;
    const previousFlipped = flashcardState.flipped;

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
        const rawCards = includeFlashcards ? bundle.flashcards : [];
        const quizQuestions = includeQuiz ? bundle.quizQuestions : [];
        let statusMessage = '';
        let flashcardExtraMessage = '';

        if (includeFlashcards) {
            if (!rawCards.length) {
                throw new Error('Korteli\u0173 negavome. Pabandyk ai\u0161kesn\u012f PDF arba pakoreguok turin\u012f.');
            }
            const { cards: preparedCards, duplicatesRemoved, keys } = prepareFlashcardBatch(rawCards);
            if (preparedCards.length === 0) {
                throw new Error('Visos naujos kortel\u0117s sutapo su ankstesn\u0117mis. Pabandyk kit\u0105 PDF arba pasirink kitok\u012f korteli\u0173 kiek\u012f.');
            }
            flashcardState.cards = preparedCards;
            flashcardState.index = 0;
            flashcardState.flipped = false;
            resetFlashcardRunState();
            persistFlashcardHistoryKeys(keys);
            requestFlashcardFrontReset();
            renderFlashcard();
            if (duplicatesRemoved > 0) {
                flashcardExtraMessage = ' Pasikartojan\u010dios kortel\u0117s praleistos automati\u0161kai.';
            }
            statusMessage = 'Kortel\u0117s paruo\u0161tos!' + flashcardExtraMessage;
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
            if (includeFlashcards && flashcardExtraMessage) {
                statusMessage += flashcardExtraMessage;
            }
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
        if (previousFlashcards.length > 0 && flashcardState.cards.length === 0) {
            flashcardState.cards = previousFlashcards;
            flashcardState.index = Math.min(previousIndex, flashcardState.cards.length - 1);
            flashcardState.flipped = Boolean(previousFlipped && flashcardState.cards.length > 0);
            requestFlashcardFrontReset();
            renderFlashcard();
        }
        setFlashcardStatus(error.message || 'Kuriant korteles \u012fvyko klaida.', 'error');
    } finally {
        setGenerationBusy(false);
    }
});


loadStoredCredential();
loadRewardState();
if (nameInput) {
    nameInput.value = state.name;
}
updateGreetingNames();

setFlashcardStatus('');
updateFlashcardWidgetVisibility();
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
timetableToggleWeekBtn?.addEventListener('click', () => {
    if (!latestWeekContext.weekStart) {
        return;
    }
    timetableViewOffset = (timetableViewOffset + 1) % WEEK_ROTATION_LENGTH;
    updateTimetableToggleLabel();
    renderTimetableSection();
});
updateWeekIndicator();
scheduleWeekIndicatorUpdate();
initImportantDatesSection();
window.addEventListener('resize', scheduleLayoutTopSync);
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateWeekIndicator();
    }
});
showScreen('intro');
scheduleSplashHide();
<<<<<<< HEAD
if (typeof ensureNotepadPlaceholder === 'function') {
    ensureNotepadPlaceholder(true);
}
initialiseBlockJamMode();
scheduleLayoutTopSync();
=======
ensureNotepadPlaceholder(true);
applyChristmasTheme();
setInterval(applyChristmasTheme, 60 * 60 * 1000);
>>>>>>> christmas
