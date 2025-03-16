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
const gameOverPopup = document.getElementById("game-over-popup");
const finalScoreDisplay = document.getElementById("final-score");
const tryAgainButton = document.getElementById("try-again");
const shareButton = document.getElementById("share");

// Game Variables
let playerName = "";
let score = 0;
let level = "Easy";
let timeLeft = 0;
let timerInterval;
let signX, signY, signWidth, signHeight;
let currentImageIndex = 0;
let images = [];

// Image Paths
const imagePaths = {
    Easy: ["./images/easy1.jpg", "./images/easy2.jpg", "./images/easy3.jpg", "./images/easy4.jpg", "./images/easy5.jpg"],
    Medium: ["./images/medium1.jpg", "./images/medium2.jpg", "./images/medium3.jpg", "./images/medium4.jpg", "./images/medium5.jpg", "./images/medium6.jpg"],
    Hard: ["./images/hard1.jpg", "./images/hard2.jpg", "./images/hard3.jpg", "./images/hard4.jpg", "./images/hard5.jpg", "./images/hard.jpg"],
    "Extremely Hard": ["./images/extremely-hard.jpg"],
};

// Points Configuration
const POINTS_PER_LEVEL = {
    Easy: 1,
    Medium: 5,
    Hard: 15,
    "Extremely Hard": 20,
};

// Timer Configuration
const TIMER_PER_LEVEL = {
    Easy: 0,
    Medium: 20,
    Hard: 15,
    "Extremely Hard": 10,
};

// Sound Effects
const clickSound = new Audio("./sounds/click.mp3");
const gameOverSound = new Audio("./sounds/game-over.mp3");

// Button Events
buttons.name.addEventListener("click", () => showScreen("nameForm"));
buttons.signee.addEventListener("click", () => showScreen("signeeOptions"));
buttons.yes.addEventListener("click", () => showScreen("nameForm"));
buttons.no.addEventListener("click", () => showScreen("introduceSign"));
buttons.introName.addEventListener("click", () => showScreen("nameForm"));

form.addEventListener("submit", (e) => {
    e.preventDefault();
    playerName = nameInput.value.trim();
    if (playerName) {
        startGame();
    } else {
        alert("Please enter your name!");
    }
});

// Game Functions
function showScreen(screen) {
    if (screens[screen]) {
        Object.values(screens).forEach((s) => (s.style.display = "none"));
        screens[screen].style.display = "flex";
    } else {
        console.error(`Screen "${screen}" is undefined. Check your HTML IDs.`);
    }
}

function startGame() {
    showScreen("gameContainer");
    greeting.textContent = `Welcome, ${playerName}! Let's play!`;
    canvas.width = 800;
    canvas.height = 600;
    score = 0;
    level = "Easy";
    timeLeft = TIMER_PER_LEVEL[level];
    images = imagePaths[level];
    currentImageIndex = 0;
    updateScore();
    updateTimer();
    loadNextImage();
    startTimer();
}

function updateScore() {
    scoreDisplay.textContent = score;
}

function updateTimer() {
    timerDisplay.textContent = `Time: ${timeLeft}s`;
}

function startTimer() {
    clearInterval(timerInterval);
    if (timeLeft > 0) {
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimer();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                gameOver();
            }
        }, 1000);
    }
}

function loadNextImage() {
    if (currentImageIndex >= images.length) {
        alert("No more images! You completed the level.");
        resetGame();
        return;
    }
    const img = new Image();
    img.src = images[currentImageIndex++];
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        renderSign();
    };
}

function renderSign() {
    signX = Math.random() * (canvas.width - 100);
    signY = Math.random() * (canvas.height - 50);
    ctx.font = "30px Arial";
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)"; // Semi-transparent red for camouflage
    ctx.fillText("SIGN", signX, signY);
    signWidth = ctx.measureText("SIGN").width;
    signHeight = 30; // Fixed height for the text
}

function advanceLevel() {
    switch (level) {
        case "Easy":
            level = "Medium";
            break;
        case "Medium":
            level = "Hard";
            break;
        case "Hard":
            level = "Extremely Hard";
            break;
        case "Extremely Hard":
            // No further levels
            return;
    }

    images = imagePaths[level];
    currentImageIndex = 0;
    timeLeft = TIMER_PER_LEVEL[level];
    showLevelUpPopup(`LEVEL UP: ${level} MODE!`);
    startTimer();
}

function showLevelUpPopup(message) {
    levelUpPopup.textContent = message;
    levelUpPopup.style.display = "block";
    setTimeout(() => {
        levelUpPopup.style.display = "none";
    }, 2000);
}

function gameOver() {
    gameOverSound.play();
    finalScoreDisplay.textContent = score;
    gameOverPopup.style.display = "flex";
}

tryAgainButton.addEventListener("click", () => {
    gameOverPopup.style.display = "none";
    resetGame();
});

shareButton.addEventListener("click", () => {
    const tweetText = `I scored ${score} points in the Sign Finder game! Can you beat me?`;
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, "_blank");
});

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (clickX > signX && clickX < signX + signWidth && clickY > signY - signHeight && clickY < signY) {
        clickSound.play();
        score += POINTS_PER_LEVEL[level];
        updateScore();

        if (level !== "Extremely Hard" && currentImageIndex >= images.length) {
            advanceLevel();
        }

        if (level !== "Easy") {
            timeLeft = TIMER_PER_LEVEL[level];
        }

        loadNextImage();
    }
});

function resetGame() {
    clearInterval(timerInterval);
    showScreen("welcome");
}

// Initialize the game
console.log("Game initialized. Check for errors in the console.");
