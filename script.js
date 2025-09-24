'use strict';

const screens = document.querySelectorAll('.screen');
const nameInput = document.getElementById('name-input');
const introForm = document.getElementById('intro-form');
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const startGameBtn = document.getElementById('start-game');
const optionsContainer = document.getElementById('options');
const roundTitle = document.getElementById('round-title');
const roundScene = document.getElementById('round-scene');
const roundIndicator = document.getElementById('round-indicator');
const sparklePoints = document.getElementById('sparkle-points');
const sparkleIndicator = document.getElementById('sparkle-indicator');
const resultPanel = document.getElementById('round-result');
const techniqueText = document.getElementById('technique-text');
const affirmationText = document.getElementById('affirmation-text');
const treatText = document.getElementById('treat-text');
const nextRoundBtn = document.getElementById('next-round');
const recapIntro = document.getElementById('recap-intro');
const recapTasks = document.getElementById('recap-tasks');
const recapVibe = document.getElementById('recap-vibe');
const playAgainBtn = document.getElementById('play-again');
const editQuestsBtn = document.getElementById('edit-quests');

const HEART = '\u2661';
const SPARKLE = '\u2728';

const state = {
    name: 'Emilija',
    tasks: [],
    selectedTasks: [],
    currentRound: 0,
    totalRounds: 0,
    sparkle: 0,
    roundResolved: false,
};

const ROUNDS = [
    {
        title: 'Blushing Blueprint',
        scene: 'You step into the Pink Study Lounge, walls shimmering with rose quartz hues. On a velvet chaise rests today\'s focus: {task}.',
        options: [
            {
                label: 'Velvet Vision Board',
                description: 'Sketch the cutest storyboard for this concept while high-heeled bookmarks keep your notes in line. Group key ideas into three spotlight moments.',
                technique: 'Create a mini mind-map using colors: blush for main ideas, champagne for details.',
                boost: 3,
            },
            {
                label: 'Cotton Candy Countdown',
                description: 'Set a 15-minute timer, nibble on white chocolate bark, and race the clock to capture the juiciest facts before the bell.',
                technique: 'Sprint-study for 15 minutes, then spend 3 minutes summarizing the highlights aloud.',
                boost: 2,
            },
            {
                label: 'Blossom Buddy Notes',
                description: 'Invite your inner glam squad: narrate the topic like a runway host while noting three dazzling takeaways to text your study partner.',
                technique: 'Teach it back in your own words and voice-record the recap for later replays.',
                boost: 4,
            },
        ],
    },
    {
        title: 'Heel Haute Hustle',
        scene: 'Marble runways guide you to the Focus Atrium. Strappy stilettos click with determination as the next sparkle mission emerges: {task}.',
        options: [
            {
                label: 'Runway Rehearsal',
                description: 'Strut through flashcards like they\'re finale looks. Each confident answer earns a salty caramel star pinned to your sash.',
                technique: 'Flip each card twice: once for recall, once to explain why it matters.',
                boost: 3,
            },
            {
                label: 'Glossy Grid Shuffle',
                description: 'Lay your notes out like a boutique display, matching concepts to their glam partners.',
                technique: 'Use a table: column one for terms, column two for glittery real-life examples.',
                boost: 2,
            },
            {
                label: 'Stiletto Stepbacks',
                description: 'Every 10 minutes, pause, breathe, adjust the tiara, and ask: "What\'s the boldest idea I\'m wearing right now?".',
                technique: 'Cycle focus with three Pomodoro rounds, celebrating each break with a stretch pose.',
                boost: 4,
            },
        ],
    },
    {
        title: 'Caramel Cloud Cooldown',
        scene: 'The lounge melts into a dessert lab. Crystal jars of white chocolate pearls glow softly while a salted caramel fountain hums beside {task}.',
        options: [
            {
                label: 'Sweet Synthesis',
                description: 'Blend the topic into a parfait by stacking key ideas, supporting sprinkles, and a cherry summary on top.',
                technique: 'Summarize the chapter in five glitter-bullets, bolding the must-remember gems.',
                boost: 3,
            },
            {
                label: 'Treat Yourself Test',
                description: 'Quiz yourself with sugar-sweet questions. Each correct answer earns a drizzle of caramel confidence.',
                technique: 'Draft five self-check questions and answer them dramatically in the mirror.',
                boost: 4,
            },
            {
                label: 'Glow Journal Moment',
                description: 'Jot three moments you felt genuinely beautiful mastering this material. Seal it with a kiss of gratitude.',
                technique: 'Reflect in a journal: write one sensory detail, one insight, one proud mantra.',
                boost: 2,
            },
        ],
    },
];

const AFFIRMATIONS = [
    'Your sparkle is study-proof!',
    'Glamour and grit? You own both.',
    'Every concept bows to your brilliance.',
    'Heels high, focus higher.',
    'Sweet success tastes like white chocolate victory.',
];

const TREATS = ['white chocolate curl', 'salty caramel sparkle', 'pink macaron', 'sugar crystal'];

function showScreen(id) {
    screens.forEach((screen) => {
        screen.classList.toggle('screen--active', screen.dataset.screen === id);
    });
}

function resetRoundState() {
    state.roundResolved = false;
    resultPanel.hidden = true;
    techniqueText.textContent = '';
    affirmationText.textContent = '';
    treatText.textContent = '';
}

function updateTaskList() {
    taskList.innerHTML = '';

    if (state.tasks.length === 0) {
        const placeholder = document.createElement('li');
        placeholder.className = 'task-placeholder';
        const icon = document.createElement('span');
        icon.className = 'task-icon';
        icon.textContent = HEART;
        const label = document.createElement('span');
        label.className = 'task-label';
        label.textContent = 'No quests yet -- add something dreamy!';
        placeholder.append(icon, label);
        taskList.appendChild(placeholder);
    } else {
        state.tasks.forEach((task, index) => {
            const item = document.createElement('li');
            const icon = document.createElement('span');
            icon.className = 'task-icon';
            icon.textContent = HEART;
            const label = document.createElement('span');
            label.className = 'task-label';
            label.textContent = task;
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.setAttribute('aria-label', `Remove quest ${index + 1}`);
            remove.textContent = '\u00d7';
            remove.addEventListener('click', () => {
                state.tasks.splice(index, 1);
                updateTaskList();
            });
            item.append(icon, label, remove);
            taskList.appendChild(item);
        });
    }

    addTaskBtn.disabled = state.tasks.length >= 3;
    addTaskBtn.textContent = state.tasks.length >= 3 ? 'Max quests reached' : 'Add Quest';
    startGameBtn.disabled = state.tasks.length === 0;
}

function prepareGame() {
    state.selectedTasks = state.tasks.slice(0, ROUNDS.length);
    if (state.selectedTasks.length === 0) {
        state.selectedTasks = ['daydreaming up your next big idea'];
    }
    state.totalRounds = state.selectedTasks.length;
    state.currentRound = 0;
    state.sparkle = 0;
    resetRoundState();
    renderRound();
    showScreen('game');
}

function renderRound() {
    const roundData = ROUNDS[state.currentRound];
    const focusTask = state.selectedTasks[state.currentRound] || state.selectedTasks[0];

    roundTitle.textContent = `${HEART} ${roundData.title} ${HEART}`;
    roundScene.textContent = roundData.scene.replace('{task}', focusTask);
    roundIndicator.textContent = `Round ${state.currentRound + 1} / ${state.totalRounds}`;
    sparklePoints.textContent = state.sparkle.toString();
    sparkleIndicator.setAttribute('data-points', state.sparkle.toString());

    optionsContainer.innerHTML = '';
    resetRoundState();

    roundData.options.forEach((option) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'option-card';
        card.setAttribute('aria-pressed', 'false');

        const badge = document.createElement('span');
        badge.className = 'option-card__badge';
        badge.textContent = `+${option.boost} SP`;

        const label = document.createElement('span');
        label.className = 'option-card__label';
        label.textContent = option.label;

        const description = document.createElement('p');
        description.className = 'option-card__description';
        description.textContent = option.description;

        card.append(badge, label, description);
        card.addEventListener('click', () => handleOptionSelect(option, card));
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleOptionSelect(option, card);
            }
        });

        optionsContainer.appendChild(card);
    });

    nextRoundBtn.textContent = state.currentRound + 1 === state.totalRounds ? 'See the Radiance Recap' : 'Next Glow Moment';
}

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function handleOptionSelect(option, selectedCard) {
    if (state.roundResolved) return;

    state.roundResolved = true;
    state.sparkle += option.boost;
    sparklePoints.textContent = state.sparkle.toString();

    const cards = optionsContainer.querySelectorAll('.option-card');
    cards.forEach((card) => {
        card.classList.add('disabled');
        card.setAttribute('aria-pressed', card === selectedCard ? 'true' : 'false');
    });

    selectedCard.classList.add('selected');

    techniqueText.textContent = option.technique;
    affirmationText.textContent = `${SPARKLE} ${randomItem(AFFIRMATIONS)}`;
    treatText.textContent = `Reward unlocked: a ${randomItem(TREATS)}!`;

    resultPanel.hidden = false;
    nextRoundBtn.focus();
}

function handleNextRound() {
    if (!state.roundResolved) {
        return;
    }

    state.currentRound += 1;
    if (state.currentRound >= state.totalRounds) {
        showRecap();
    } else {
        renderRound();
    }
}

function showRecap() {
    showScreen('recap');
    recapTasks.innerHTML = '';

    recapIntro.textContent = `${state.name}, here\'s your glitter trail:`;

    state.selectedTasks.forEach((task, index) => {
        const item = document.createElement('li');
        const icon = document.createElement('span');
        icon.className = 'task-icon';
        icon.textContent = HEART;
        const label = document.createElement('span');
        label.className = 'task-label';
        label.textContent = `${index + 1}. ${task}`;
        item.append(icon, label);
        recapTasks.appendChild(item);
    });

    const vibe = state.sparkle >= 10 ? 'Effortlessly Elegant' : state.sparkle >= 7 ? 'Sweetly Focused' : 'Soft Start';
    recapVibe.textContent = `${state.name}, your study aura today is ${vibe}. Keep pairing gorgeous aesthetics with mindful breaks, and every subject becomes part of your personal catwalk.`;
}

function resetForReplay() {
    state.currentRound = 0;
    state.sparkle = 0;
    state.roundResolved = false;
    if (state.selectedTasks.length === 0) {
        state.selectedTasks = state.tasks.slice(0, ROUNDS.length);
    }
    state.totalRounds = state.selectedTasks.length || 1;
    renderRound();
    showScreen('game');
}

introForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const rawName = nameInput.value.trim();
    state.name = rawName || 'Emilija';
    showScreen('tasks');
    setTimeout(() => taskInput.focus(), 120);
});

addTaskBtn.addEventListener('click', () => {
    const value = taskInput.value.trim();
    if (!value) {
        taskInput.focus();
        return;
    }
    if (state.tasks.length >= 3) {
        return;
    }
    state.tasks.push(value);
    taskInput.value = '';
    updateTaskList();
    taskInput.focus();
});

taskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        addTaskBtn.click();
    }
});

startGameBtn.addEventListener('click', () => {
    if (state.tasks.length === 0) {
        taskInput.focus();
        return;
    }
    prepareGame();
});

nextRoundBtn.addEventListener('click', handleNextRound);
playAgainBtn.addEventListener('click', resetForReplay);
editQuestsBtn.addEventListener('click', () => {
    showScreen('tasks');
    updateTaskList();
    setTimeout(() => taskInput.focus(), 120);
});

// Initialize view
updateTaskList();
showScreen('intro');
