'use strict';

const screens = document.querySelectorAll('.screen');
const nameInput = document.getElementById('name-input');
const introForm = document.getElementById('intro-form');

const flashcardForm = document.getElementById('flashcard-form');
const pdfInput = document.getElementById('pdf-input');
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

const introApiKeyInput = document.getElementById('intro-api-key');
const introToggleKeyBtn = document.getElementById('intro-toggle-key');
const introRememberKeyCheckbox = document.getElementById('intro-remember-key');
const editSetupBtn = document.getElementById('edit-setup');

const splash = document.querySelector('.welcome-splash');
const splashName = document.getElementById('splash-name');
const splashRunner = document.querySelector('.welcome-splash__runner');

const notepadForm = document.getElementById('notepad-form');
const notepadInput = document.getElementById('notepad-input');
const notepadList = document.getElementById('notepad-list');
const notepadEmpty = document.querySelector('.notepad-empty');

const stickyBoard = document.getElementById('sticky-board');
const stickyEmpty = document.getElementById('sticky-empty');
const clearStickiesBtn = document.getElementById('clear-stickies');

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

    { text: 'Atsipalaiduoti ir para\u0161yti', weight: 1 },

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

function scheduleSplashHide(delay = 2600) {
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
        }, 260);
    }, delay);
}



async function extractTextFromPdf(file) {
    if (!window.pdfjsLib) {
        throw new Error('Nepavyko įkelti PDF pagalbinės bibliotekos. Patikrink ryšį ir įkelk puslapį iš naujo.');
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

async function fetchFlashcardsFromApi(text, apiKey) {
    const prompt = [
        {
            role: 'system',
            content:
                'You are a bubbly study coach who only responds with compact JSON. Return an array under "flashcards", each item with "question", "answer", and optional "tags" (array). Keep questions friendly, answers concise, no markdown.',
        },
        {
            role: 'user',
            content: `Create 8 flashcards from this study material. Focus on key facts, definitions, or processes. ${text}`,
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
    return normaliseFlashcards(rawContent);
}

function normaliseFlashcards(rawContent) {
    if (!rawContent) return [];
    const cleaned = rawContent.replace(/```json|```/gi, '').trim();
    let parsed;

    try {
        parsed = JSON.parse(cleaned);
    } catch (error) {
        return [];
    }

    const items = Array.isArray(parsed) ? parsed : parsed.flashcards;
    if (!Array.isArray(items)) return [];

    return items
        .map((item) => ({
            question: String(item.question || '').trim(),
            answer: String(item.answer || '').trim(),
            tags: Array.isArray(item.tags)
                ? item.tags.map((tag) => String(tag).trim()).filter(Boolean)
                : [],
        }))
        .filter((card) => card.question && card.answer);
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
    closeBtn.setAttribute('aria-label', 'Atsegti lapelį');
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
    introToggleKeyBtn.textContent = reveal ? 'Slėpti' : 'Rodyti';
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

flashcardForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!pdfInput) return;

    if (!state.apiKey) {
        setFlashcardStatus('Pirmiausia pradiniame ekrane įrašyk OpenAI API raktą.', 'error');
        showScreen('intro');
        introApiKeyInput?.focus();
        return;
    }

    const file = pdfInput.files && pdfInput.files[0];
    if (!file) {
        setFlashcardStatus('Pasirink PDF failą.', 'error');
        pdfInput.focus();
        return;
    }
    if (file.size > MAX_PDF_SIZE) {
        setFlashcardStatus('Pasirink PDF, mažesnį nei 8 MB, kad veiktume greitai.', 'error');
        return;
    }

    clearFlashcardWidget();
    setFlashcardStatus('Ištraukiame svarbiausias pastabas iš PDF...', 'pending');
    flashcardForm.setAttribute('aria-busy', 'true');
    if (generateFlashcardsBtn) generateFlashcardsBtn.disabled = true;

    try {
        const text = await extractTextFromPdf(file);
        if (!text) {
            throw new Error('Nepavyko nuskaityti teksto. Pabandyk PDF, kuriame tekstas yra pažymimas.');
        }

        setFlashcardStatus('Kuriame korteles per OpenAI...', 'pending');
        const cards = await fetchFlashcardsFromApi(text, state.apiKey);
        if (!cards.length) {
            throw new Error('Kortelių negavome. Pabandyk aiškesnį PDF arba pakoreguok turinį.');
        }

        flashcardState.cards = cards;
        flashcardState.index = 0;
        flashcardState.flipped = false;
        renderFlashcard();
        setFlashcardStatus('Kortelės paruoštos! Apversk ir blizgėk.', 'success');
        flashcardCard?.focus({ preventScroll: true });
    } catch (error) {
        console.error(error);
        setFlashcardStatus(error.message || 'Kuriant korteles įvyko klaida.', 'error');
    } finally {
        flashcardForm.removeAttribute('aria-busy');
        if (generateFlashcardsBtn) generateFlashcardsBtn.disabled = false;
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
showScreen('intro');
scheduleSplashHide();
ensureNotepadPlaceholder(true);
