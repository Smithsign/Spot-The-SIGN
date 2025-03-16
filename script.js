// DOM Elements
const screens = {
    welcome: document.getElementById("welcome-screen"),
    nameForm: document.getElementById("name-form-screen"),
    signeeOptions: document.getElementById("signee-options"),
    introduceSign: document.getElementById("introduce-sign"),
    gameContainer: document.getElementById("game-container"),
};

const buttons = {
    name: document.getElementById("btn-name"),
    signee: document.getElementById("btn-signee"),
    yes: document.getElementById("btn-yes"),
    no: document.getElementById("btn-no"),
    introName: document.getElementById("btn-intro-name"),
};

const form = document.getElementById("name-form");
const nameInput = document.getElementById("signee-name");
const greeting = document.getElementById("greeting");
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const levelUpPopup = document.getElementById("level-up-popup");

// Game Variables
let playerName = "";
let score = 0;
let level = "Easy"; // Default level
let timeLeft = 0;
let timerInterval;
let signX, signY, signWidth, signHeight;
let currentImageIndex = 0;
let images = [];
let clonedImages = [];

// Image Configuration
const IMAGE_CONFIG = {
    Easy: {
        count: 5,
        path: i => `./easy${i + 1}.jpg`,
        style: { size: 50, color: "yellow" },
    },
    Medium: {
        count: 6,
        path: i => `./medium${i + 1}.jpg`,
        style: { size: 40, color: "orange" },
    },
    Hard: {
        count: 16,
        path: i => `./hard${i + 1}.jpg`,
        style: { size: 30, color: "red" },
    },
    "Extremely Hard": {
        count: 1,
        path: () => `./extremely-hard.jpg`,
        style: { size: 20, color: "white" },
    },
};

// Default Style Fallback
const DEFAULT_STYLE = { size: 40, color: "black" };

// Game Settings
const POINTS_PER_LEVEL = { Easy: 1, Medium: 5, Hard: 15, "Extremely Hard": 20 };
const TIMER_PER_LEVEL = { Easy: 0, Medium: 20, Hard: 15, "Extremely Hard": 10 };

// Image Cache
const imageCache = new Map();

// Event Listeners
buttons.name.addEventListener("click", () => showScreen("nameForm"));
buttons.signee.addEventListener("click", () => showScreen("signeeOptions"));
buttons.yes.addEventListener("click", () => showScreen("nameForm"));
buttons.no.addEventListener("click", () => showScreen("introduceSign"));
buttons.introName.addEventListener("click", () => showScreen("nameForm"));
canvas.addEventListener("click", handleCanvasClick);
form.addEventListener("submit", handleFormSubmit);

// Core Game Functions
async function handleFormSubmit(e) {
    e.preventDefault();
    playerName = nameInput.value.trim();
    if (!playerName) return showError("Please enter your name!");

    try {
        await initializeGame();
    } catch (error) {
        showError(`Game initialization failed: ${error.message}`);
        resetGame();
    }
}

async function initializeGame() {
    showScreen("game-container");
    greeting.textContent = `Welcome ${playerName}! Loading...`;

    await preloadAllImages();
    setupGameCanvas();
    initializeGameState();

    greeting.textContent = `Go ${playerName}! Spot the SIGN!`;
    loadNextImage();
    startTimer();
}

async function preloadAllImages() {
    const loadPromises = [];

    for (const [levelName, config] of Object.entries(IMAGE_CONFIG)) {
        for (let i = 0; i < config.count; i++) {
            const src = config.path(i);
            if (imageCache.has(src)) continue;

            loadPromises.push(new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    console.log(`Loaded: ${src}`);
                    imageCache.set(src, img);
                    resolve();
                };
                img.onerror = () => {
                    console.error(`Failed to load: ${src}`);
                    reject(new Error(`Missing image: ${src}`));
                };
                img.src = src;
            }));
        }
    }

    await Promise.all(loadPromises);
}

function setupGameCanvas() {
    canvas.width = 800;
    canvas.height = 600;
    ctx.imageSmoothingEnabled = true;
}

function initializeGameState() {
    score = 0;
    level = "Easy";
    if (!IMAGE_CONFIG[level]) {
        throw new Error(`Invalid level: ${level}`);
    }
    timeLeft = TIMER_PER_LEVEL[level];
    images = Array.from({ length: IMAGE_CONFIG[level].count }, (_, i) =>
        IMAGE_CONFIG[level].path(i)
    );
    currentImageIndex = 0;
    clonedImages = [];
    updateScore();
    updateTimer();
}

async function loadNextImage() {
    try {
        let img;
        let src;

        if (level === "Extremely Hard") {
            src = IMAGE_CONFIG["Extremely Hard"].path(0);
            img = imageCache.get(src);
            if (!img) throw new Error(`Missing base image: ${src}`);
            clonedImages.push(img);
        } else {
            if (currentImageIndex >= images.length) {
                return advanceLevel();
            }
            src = images[currentImageIndex];
            img = imageCache.get(src);
            if (!img) throw new Error(`Image not loaded: ${src}`);
            currentImageIndex++;
        }

        drawImage(img);
    } catch (error) {
        showCanvasError(error.message);
    }
}

function drawImage(img) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (level === "Extremely Hard") {
        clonedImages.forEach(clone => {
            ctx.drawImage(
                clone,
                Math.random() * (canvas.width - 100),
                Math.random() * (canvas.height - 50),
                100,
                75
            );
        });
    } else {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    renderSign();
}

function renderSign() {
    const config = IMAGE_CONFIG[level];
    if (!config || !config.style) {
        console.error(`Style configuration missing for level: ${level}`);
    }

    const { size, color } = config?.style || DEFAULT_STYLE;

    ctx.font = `${size}px Arial`;
    ctx.fillStyle = color;

    signX = Math.random() * (canvas.width - 100);
    signY = 50 + Math.random() * (canvas.height - 50);
    ctx.fillText("SIGN", signX, signY);

    const metrics = ctx.measureText("SIGN");
    signWidth = metrics.width;
    signHeight = size;
}

// Remaining functions unchanged


function advanceLevel() {
    const levels = ["Easy", "Medium", "Hard", "Extremely Hard"];
    const nextIndex = levels.indexOf(level) + 1;

    if (nextIndex >= levels.length) {
        endGame("Congratulations! You've completed all levels!");
        return;
    }

    level = levels[nextIndex];
    currentImageIndex = 0;
    images = Array.from({ length: IMAGE_CONFIG[level].count }, (_, i) =>
        IMAGE_CONFIG[level].path(i)
    );
    timeLeft = TIMER_PER_LEVEL[level];

    showLevelUpPopup(`LEVEL UP: ${level} MODE!`);
    startTimer();
    loadNextImage();
}

function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= signX && x <= signX + signWidth && y >= signY - signHeight && y <= signY) {
        score += POINTS_PER_LEVEL[level];
        updateScore();

        if (level === "Extremely Hard") clonedImages = [];
        if (level !== "Extremely Hard") timeLeft = TIMER_PER_LEVEL[level];

        loadNextImage();
    }
}

// UI Functions
function showScreen(screen) {
    Object.values(screens).forEach(s => (s.style.display = "none"));
    screens[screen].style.display = "flex";
}

function updateScore() {
    scoreDisplay.textContent = score;
}

function updateTimer() {
    timerDisplay.textContent = timeLeft > 0 ? `Time: ${timeLeft}s` : "Unlimited Time";
}

function startTimer() {
    clearInterval(timerInterval);
    if (timeLeft <= 0) return;

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) endGame("Time's up!");
    }, 1000);
}


function showLevelUpPopup(message) {
    levelUpPopup.textContent = message;
    levelUpPopup.style.display = "block";
    setTimeout(() => levelUpPopup.style.display = "none", 2000);
}

function showCanvasError(message) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "18px Arial";
    ctx.fillText("ERROR:", 20, 40);
    ctx.fillText(message, 40, 70);
    ctx.fillText("Check:", 20, 100);
    ctx.fillText("1. Browser console (F12)", 40, 130);
    ctx.fillText("2. Image files/folders exist", 40, 160);
    ctx.fillText("3. Disable browser extensions", 40, 190);
}

function showError(message) {
    alert(message);
}

function endGame(message) {
    alert(`${message}\nFinal Score: ${score}`);
    resetGame();
}

function resetGame() {
    clearInterval(timerInterval);
    showScreen("welcome");
    initializeGameState();
}

// Initialization
(async () => {
    try {
        await preloadAllImages();
    } catch (error) {
        showCanvasError(error.message);
        console.error("Preloading failed:", error);
    }
})();