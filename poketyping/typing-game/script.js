// Game Constants
const GAME_DURATION = 60;

// State
let gameState = {
    isPlaying: false,
    score: 0,
    timeLeft: GAME_DURATION,
    currentPokemon: null, // Single active pokemon
    pokemonData: [], // Master List (Filtered)
    availablePokemon: [], // Pool for spawning (removes caught ones)
    caughtCount: 0,
    showNameMode: true,
    inputModes: {
        hiragana: true,
        katakana: true,
        romaji: false
    }
};

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const finalScoreEl = document.getElementById('final-score');
const gameArea = document.getElementById('game-area');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const typeInput = document.getElementById('type-input');
const showNameToggle = document.getElementById('show-name-toggle');
const caughtCountEl = document.getElementById('caught-count');

// Input Mode Toggles
// Input Mode Toggles Removed

// --- Initialization ---
function init() {
    try {
        // Provided by pokemon-data.js (plain script, so file:// works without a server)
        const allData = window.POKEMON_DATA;
        if (!Array.isArray(allData)) throw new Error('POKEMON_DATA is not loaded');

        // Filter: Keep all variants now
        // gameState.pokemonData = allData.filter(p => p.imagePath.endsWith('_0.svg'));
        gameState.pokemonData = allData;

        // Assign Grid Index (1-based, matching CSV row order)
        // key: unique per form (image file name, e.g. "0003_1"), id is shared between forms
        gameState.pokemonData.forEach((p, index) => {
            p.gridIndex = index + 1;
            p.key = p.imagePath.split('/').pop().replace(/\.(?:png|webp|svg)$/, '');
        });

        console.log(`Loaded ${gameState.pokemonData.length} pokemons (All variants).`);

        // Restore Gallery from Save
        loadProgress();

        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', () => {
            showScreen(startScreen);
        });

        // Reset Button
        const resetProgressBtn = document.getElementById('reset-progress-btn');
        if (resetProgressBtn) {
            resetProgressBtn.addEventListener('click', () => {
                if (confirm("ほんとうにリセットしてもいいですか？\nつかまえたポケモンがいなくなります。")) {
                    resetProgress();
                }
            });
        }

        // Input handling
        typeInput.addEventListener('input', handleInput);

        // ESC Key to End Game
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && gameState.isPlaying) {
                endGame();
            }
        });

        // Keep focus
        gameScreen.addEventListener('click', () => typeInput.focus());

    } catch (e) {
        console.error("Failed to load pokemon data", e);
        alert("ゲームデータを よみこめませんでした。pokemon-data.js が index.html と おなじフォルダにあるか たしかめてね。");
    }
}

// --- Persistence ---
const CAUGHT_KEYS_STORAGE = 'caughtPokemonKeys';
const LEGACY_CAUGHT_IDS_STORAGE = 'caughtPokemonIds'; // old format: one entry per Pokedex number

function getCaughtKeys() {
    try {
        const saved = localStorage.getItem(CAUGHT_KEYS_STORAGE);
        if (saved) return JSON.parse(saved);

        // Migrate old saves: an old id counts as its first form (the one shown in the gallery before)
        const legacyIds = JSON.parse(localStorage.getItem(LEGACY_CAUGHT_IDS_STORAGE) || '[]');
        const keys = [];
        legacyIds.forEach(id => {
            const pkmn = gameState.pokemonData.find(p => p.id === id);
            if (pkmn) keys.push(pkmn.key);
        });
        if (legacyIds.length) {
            localStorage.setItem(CAUGHT_KEYS_STORAGE, JSON.stringify(keys));
            localStorage.removeItem(LEGACY_CAUGHT_IDS_STORAGE);
        }
        return keys;
    } catch (e) {
        console.error("Load failed:", e);
        return [];
    }
}

function saveProgress(pokemonData) {
    try {
        let caughtKeys = getCaughtKeys();
        if (!caughtKeys.includes(pokemonData.key)) {
            caughtKeys.push(pokemonData.key);
            localStorage.setItem(CAUGHT_KEYS_STORAGE, JSON.stringify(caughtKeys));
            console.log(`Saved progress: ${pokemonData.name} (${pokemonData.key}). Total: ${caughtKeys.length}`);
        } else {
            console.log(`Already saved: ${pokemonData.name}`);
        }
    } catch (e) {
        console.error("Save failed:", e);
    }
}

function loadProgress() {
    const caughtKeys = getCaughtKeys();
    console.log(`Loading progress. Caught: ${caughtKeys.length}`);

    // Fill Gallery
    caughtKeys.forEach(key => {
        const pkmn = gameState.pokemonData.find(p => p.key === key);
        if (pkmn) {
            addToGallery(pkmn, true);
        }
    });

    updateCaughtDisplay();
}

function resetProgress() {
    localStorage.removeItem(CAUGHT_KEYS_STORAGE);
    localStorage.removeItem(LEGACY_CAUGHT_IDS_STORAGE);
    const bgGallery = document.getElementById('bg-gallery');
    if (bgGallery) bgGallery.innerHTML = '';
    initGallery();

    // Force update display to 0
    if (caughtCountEl) {
        caughtCountEl.textContent = '0 / ' + gameState.pokemonData.length;
    }

    alert("リセットしました！");
}

// --- Game Control ---

let timerInterval;

function startGame() {
    // Read Info
    gameState.showNameMode = showNameToggle.checked;
    // Always enable all input modes
    gameState.inputModes = {
        hiragana: true,
        katakana: true,
        romaji: true
    };

    // Reset State
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.timeLeft = GAME_DURATION;
    gameState.currentPokemon = null;
    gameState.caughtCount = 0;

    // Filter Available Pool (Using Persistence)
    const caughtKeys = getCaughtKeys();
    gameState.availablePokemon = gameState.pokemonData.filter(p => !caughtKeys.includes(p.key));

    console.log(`Starting game. Available: ${gameState.availablePokemon.length} / Total: ${gameState.pokemonData.length}`);

    // If all caught
    if (gameState.availablePokemon.length === 0) {
        alert("すごい！ぜんぶつかまえたよ！");
        // Don't reset automatically here as user wanted persistence.
        // endGame or just show nothing?
    }

    // UI Reset
    scoreEl.textContent = '0';
    updateCaughtDisplay();
    timerEl.textContent = GAME_DURATION;
    gameArea.innerHTML = '';
    typeInput.value = '';

    showScreen(gameScreen);
    typeInput.focus();

    // Start Timer
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        gameState.timeLeft--;
        timerEl.textContent = gameState.timeLeft;
        if (gameState.timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);

    // Initial Spawn
    spawnPokemon();

    // Start Loop
    lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function updateCaughtDisplay() {
    if (!gameState.pokemonData.length) {
        console.warn("Pokemon data not loaded yet for display update");
        return;
    }
    const total = gameState.pokemonData.length;
    const caughtCount = getCaughtKeys().length;

    if (caughtCountEl) {
        caughtCountEl.textContent = `${caughtCount} / ${total}`;
    } else {
        console.error("Caught count element not found!");
    }
}

function endGame() {
    gameState.isPlaying = false;
    clearInterval(timerInterval);

    // Play Chime
    playChime();

    // Show Result
    showScreen(resultScreen);

    finalScoreEl.textContent = gameState.score;

    if (gameState.currentPokemon?.element) {
        gameState.currentPokemon.element.remove();
    }
    gameState.currentPokemon = null;
}

let lastFrameTime = 0;
function gameLoop(timestamp) {
    if (!gameState.isPlaying) return;

    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    if (gameState.currentPokemon) {
        updatePokemonPosition(gameState.currentPokemon, deltaTime);
    }

    requestAnimationFrame(gameLoop);
}

function spawnPokemon() {
    if (gameState.availablePokemon.length === 0) {
        endGame();
        return;
    }

    const randomIndex = Math.floor(Math.random() * gameState.availablePokemon.length);
    const data = gameState.availablePokemon[randomIndex];

    // Remove from available immediately? Or only on catch?
    // "Don't question caught pokemon". so if we miss it, it can come back.
    // So we don't remove here. We remove on Success.

    // But wait, if we only remove on success, duplicates can appear in sequence?
    // It's random, so possible.

    const pokemon = {
        id: Date.now(),
        data: data,
        x: -20, // Start slightly off screen
        speed: 7, // Speed in % per second
        element: null,
        isResolved: false // To prevent double processing
    };

    // Create DOM
    const el = document.createElement('div');
    el.className = 'pokemon-card';
    el.innerHTML = `
        <img src="${data.imagePath}" alt="${data.name}">
        <div class="pokemon-name-kana">${data.name}</div>
    `;

    // Apply Hidden class if needed
    if (!gameState.showNameMode) {
        el.querySelector('.pokemon-name-kana').classList.add('hidden');
    }

    // Set fixed lane
    el.style.top = `40%`;

    gameArea.appendChild(el);
    pokemon.element = el;
    pokemon.element.classList.add('active'); // Use active style

    gameState.currentPokemon = pokemon;
}

function updatePokemonPosition(pokemon, deltaTimeMs) {
    if (pokemon.isResolved) return; // Stop moving if resolved (waiting for anim)

    // constant movement
    const moveAmt = pokemon.speed * (deltaTimeMs / 1000);
    pokemon.x += moveAmt;
    pokemon.element.style.left = `${pokemon.x}%`;

    // Hint Logic: Reveal if close to edge (e.g., > 80%)
    if (pokemon.x > 80 && !gameState.showNameMode) {
        const nameEl = pokemon.element.querySelector('.pokemon-name-kana');
        if (nameEl && nameEl.classList.contains('hidden')) {
            nameEl.classList.add('reveal');
        }
    }

    // Check if off screen
    if (pokemon.x > 115) {
        // Missed!
        pokemon.element.remove();
        gameState.currentPokemon = null;

        // Clear input on miss
        typeInput.value = '';

        // Spawn next immediately
        spawnPokemon();
    }
}

// --- Input Logic ---

// --- Input Logic ---

function matchesKanaWithOptionalFinalN(input, target) {
    const inputKana = toHiragana(input);
    const targetKana = toHiragana(target);
    if (targetKana.endsWith('ん')) {
        // A final ン may be typed as n, nn, or with extra n characters.
        return inputKana.replace(/[んnｎＮ]+$/i, 'ん') === targetKana;
    }
    return inputKana === targetKana;
}

function handleInput(e) {
    if (!gameState.isPlaying || !gameState.currentPokemon) return;
    if (gameState.currentPokemon.isResolved) {
        typeInput.value = ''; // Discard keys still arriving after a correct final ン.
        return;
    }

    // --- Custom Replacements (: -> ：, X -> Ｘ, etc.) ---
    let preVal = typeInput.value;
    const replacements = [
        { src: ':', dest: '：' },
        { src: 'X', dest: 'Ｘ' },
        { src: 'Y', dest: 'Ｙ' },
        { src: '/', dest: '・' }
    ];
    let modified = false;

    // Replace all occurrences
    replacements.forEach(r => {
        // Simple string replaceAll (safe for these symbols)
        if (preVal.indexOf(r.src) !== -1) {
            preVal = preVal.replaceAll(r.src, r.dest);
            modified = true;
        }
    });

    if (modified) {
        typeInput.value = preVal;
        // Move cursor to end (Simplified for typing game)
        typeInput.setSelectionRange(preVal.length, preVal.length);
    }
    // ----------------------------------------------------

    // --- Romaji -> Kana Conversion Logic ---
    const originalVal = typeInput.value;
    const convertedVal = toKana(originalVal);

    if (convertedVal !== originalVal) {
        // Update input value with converted kana
        // Use setRangeText to try and preserve cursor if possible, though usually at end
        const start = typeInput.selectionStart;
        const end = typeInput.selectionEnd;
        typeInput.value = convertedVal;

        // Restore cursor position if possible (rough approximation)
        // If length changed (e.g. ka -> か), cursor might need adjustment.
        // For a typing game, assume appending at end is most common.
        // If we are appending, just move to end.
        typeInput.setSelectionRange(typeInput.value.length, typeInput.value.length);
    }
    // ---------------------------------------

    const inputVal = typeInput.value.trim();
    if (!inputVal) return; // Ignore empty

    const data = gameState.currentPokemon.data;
    const targetKana = data.name; // This might contain "Name (SubName)"

    let isMatch = false;

    // Helper to generate text variations (e.g., "Raichu (Alola)" -> ["Raichu (Alola)", "Raichu"])
    // Supports both Full Width '（' and Half Width '('
    // Also removes gender symbols ♂ (Male) and ♀ (Female)
    function getVariations(str) {
        const variants = [str];
        // Remove content inside parens AND gender symbols
        const cleaned = str.replace(/[\(（].*?[\)）]/g, '')
            .replace(/[♂♀]/g, '')
            .trim();

        if (cleaned !== str && cleaned.length > 0) {
            variants.push(cleaned);
        }
        return variants;
    }

    const variations = getVariations(targetKana);

    // Check Input against all Name Variations (Original & Cleaned)
    for (const targetVariant of variations) {
        if (isMatch) break; // Already matched

        // 1. Hiragana Check (Converted input is already Hiragana or mixed)
        if (gameState.inputModes.hiragana) {
            if (matchesKanaWithOptionalFinalN(inputVal, targetVariant)) {
                isMatch = true;
            }
        }

        // 2. Katakana Check
        if (!isMatch && gameState.inputModes.katakana) {
            // Compare input (converted to hiragana usually) with target (as Hiragana)
            // Or if target is Katakana, inputVal (Hiragana) matches?
            // "toHiragana" normalizes everything to Hiragana for comparison.
            // If input is "ピカチュウ" (Katakana typed directly?) or "ぴかちゅう" (Converted)
            // targetVariant is "ピカチュウ".
            // toHiragana("ピカチュウ") === toHiragana("ぴかちゅう"). MATCH.
            // So checking toHiragana() equality covers both.
            if (matchesKanaWithOptionalFinalN(inputVal, targetVariant)) {
                isMatch = true;
            }
        }

        // 3. Romaji Check
        if (!isMatch && gameState.inputModes.romaji) {
            // If input was converted to Kana (e.g. 'か'), we need to compare against Romaji target ('ka').
            // Convert Input Kana BACK to Romaji to check.
            const inputRomaji = toRomaji(inputVal);

            // Generate Target Romaji from targetVariant (Kana)
            const sourceKana = data.kana || data.name;
            const kanaVariations = getVariations(sourceKana); // usually same as variations if name=kana

            for (const kv of kanaVariations) {
                const targetRomaji = toRomaji(kv);
                const normalizedInputRomaji = toHiragana(kv).endsWith('ん')
                    ? inputRomaji.replace(/n+$/i, 'n')
                    : inputRomaji;
                if (targetRomaji && normalizedInputRomaji && normalizedInputRomaji.toLowerCase() === targetRomaji.toLowerCase()) {
                    isMatch = true;
                    break;
                }
            }
        }
    }

    if (isMatch) {
        handleSuccess();
    }
}
let isComposing = false;
let clearImePending = false;

typeInput.addEventListener('compositionstart', () => {
    isComposing = true;
});

typeInput.addEventListener('compositionend', () => {
    isComposing = false;

    // IME確定が終わった“後”に最終クリアを入れる
    if (clearImePending) {
        typeInput.value = '';
        clearImePending = false;
    }
});

typeInput.addEventListener('input', () => {
    // 正解直後に飛んでくる input（最後の1文字commit）を潰す
    if (clearImePending) {
        typeInput.value = '';
    }
});

const imeSink = document.getElementById('imeSink');

function closeImePopup() {
    imeSink.focus();           // フォーカスを別へ
    setTimeout(() => {
        typeInput.value = '';
        typeInput.focus();       // 戻す
    }, 0);
}

function handleSuccess() {
    // Success!
    gameState.score += 100;
    scoreEl.textContent = gameState.score;

    // Mark as resolved to stop movement
    gameState.currentPokemon.isResolved = true;

    // Visual Feedback
    const nameEl = gameState.currentPokemon.element.querySelector('.pokemon-name-kana');
    if (nameEl) {
        nameEl.classList.remove('hidden'); // Reveal if hidden
        nameEl.classList.add('success-text');
    }
    gameState.currentPokemon.element.classList.add('success');

    // --- IME対策ここから ---
    clearImePending = true;     // 正解直後のIME確定入力を潰す
    typeInput.blur();

    // 「今のタスクが終わった後」にもクリア（compositionendより後に来るinput対策）
    setTimeout(() => {
        typeInput.value = '';
        // フォーカス復帰（必要なら少し遅らせてもOK）
        typeInput.focus();
        // 念のためフォーカス後にもクリア（環境差対策）
        typeInput.value = '';

        // Manual reset of pending flag (Fix for Non-IME mode)
        // If compositionend never fires (because no IME), this flag would stick.
        // We reset it here to allow future input.
        clearImePending = false;
    }, 0);
    // --- IME対策ここまで ---

    closeImePopup();

    // Add to Gallery (Background) AND Save
    addToGallery(gameState.currentPokemon.data);
    saveProgress(gameState.currentPokemon.data);

    // Update Available Pool (Remove caught one immediately)
    const caughtKey = gameState.currentPokemon.data.key;
    gameState.availablePokemon = gameState.availablePokemon.filter(p => p.key !== caughtKey);

    // Update UI
    updateCaughtDisplay();

    // --- Async Clear Logic ---
    // 1. Force close IME by blurring
    //typeInput.blur();

    // 2. Clear the value immediately
    //typeInput.value = '';

    // 3. ASYNC Focus: Wait for browser to fully process the blur/composition-end
    // This slight delay (10ms) is crucial to prevent the IME from "resuming" the previous session
    //setTimeout(() => {
    //    typeInput.focus();
    //}, 10);

    // Delay for animation
    setTimeout(() => {
        // Remove old
        if (gameState.currentPokemon && gameState.currentPokemon.element) {
            gameState.currentPokemon.element.remove();
        }
        gameState.currentPokemon = null;

        // Spawn next
        spawnPokemon();
    }, 500); // 0.5s delay
}

const bgGallery = document.getElementById('bg-gallery');

// Initialize Gallery Grid (1050 cells)
function initGallery() {
    if (!bgGallery) return;
    bgGallery.innerHTML = ''; // Clear

    // 26x50 = 1300
    const totalCells = 26 * 50;

    for (let i = 1; i <= totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'gallery-cell';
        cell.dataset.number = i; // For CSS ::before
        // We can also store ID if needed, but Index is simpler

        bgGallery.appendChild(cell);
    }
}

// Call init once
initGallery();

function addToGallery(pokemonData, skipSave = false) {
    if (!bgGallery) return;

    // Use gridIndex assigned during init
    const gridIdx = pokemonData.gridIndex;

    if (!gridIdx || gridIdx < 1) return;

    // Get the cell (1-based index usually matched by position in childNodes)
    // children[0] is #1, children[gridIdx-1] is gridIdx

    // Safety check for range
    if (gridIdx > bgGallery.children.length) return;

    const targetCell = bgGallery.children[gridIdx - 1]; // 0-indexed array, 1-based Index

    if (!targetCell) return;

    // Check if image already exists
    if (targetCell.querySelector('img')) return;

    const img = document.createElement('img');
    img.src = pokemonData.imagePath;
    img.alt = pokemonData.id;

    targetCell.appendChild(img);
}

// --- Helpers ---

// Katakana to Hiragana converter
function toHiragana(str) {
    return str.replace(/[\u30a1-\u30f6]/g, function (match) {
        var chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
    });
}

function showScreen(screenEl) {
    [startScreen, gameScreen, resultScreen].forEach(el => {
        el.classList.remove('active');
    });
    screenEl.classList.add('active');
}

// Start
init();

// --- Audio ---
function playChime() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const now = ctx.currentTime;

        // Simple "Ding-Dong" chime using 2 oscillators
        // Note 1: High pitch (e.g., C6)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.frequency.setValueAtTime(880.0, now); // A5
        gain1.gain.setValueAtTime(0.5, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

        osc1.start(now);
        osc1.stop(now + 1.5);

        // Note 2: Lower pitch (e.g., F5) - slightly delayed
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.frequency.setValueAtTime(698.46, now + 0.4); // F5
        gain2.gain.setValueAtTime(0.5, now + 0.4);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

        osc2.start(now + 0.4);
        osc2.stop(now + 2.5);

    } catch (e) {
        console.warn("Audio play failed", e);
    }
}
