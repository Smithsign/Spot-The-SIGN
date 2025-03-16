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
const loadingSpinner = document.getElementById("loading-spinner");

// Game Variables
let playerName = "";
let score = 0;
let level = "Easy";
let timeLeft = 0;
let timerInterval;
let signX, signY, signWidth, signHeight;
let currentImageIndex = 0;
let images = [];
let isGameOver = false;

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

// Confetti Configuration
const confettiSettings = { 
    particleCount: 100, 
    spread: 70, 
    origin: { y: 0.6 }, 
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
};

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
        screens[screen].classList.add("fade-in");
    } else {
        console.error(`Screen "${screen}" is undefined. Check your HTML IDs.`);
    }
}

function startGame() {
    isGameOver = false;
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
    scoreDisplay.classList.add("pop");
    setTimeout(() => scoreDisplay.classList.remove("pop"), 200);
}

function updateTimer() {
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    
    // Add pulse animation when time is low
    if (timeLeft <= 10 && timeLeft > 0) {
        timerDisplay.classList.add("pulse");
    } else {
        timerDisplay.classList.remove("pulse");
    }
}

function startTimer() {
    clearInterval(timerInterval);
    if (timeLeft > 0) {
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimer();
            if (timeLeft <= 0 && !isGameOver) {
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
    loadingSpinner.style.display = "flex";
    const img = new Image();
    img.src = images[currentImageIndex++];
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        renderSign();
        loadingSpinner.style.display = "none";
    };
}

function renderSign() {
    signX = Math.random() * (canvas.width - 100);
    signY = Math.random() * (canvas.height - 50);
    signWidth = 100; // Fixed width for easier click detection
    signHeight = 30; // Fixed height for easier click detection

    ctx.save();
    ctx.translate(signX, signY);
    ctx.rotate((Math.random() - 0.5) * 0.5); // Random rotation
    ctx.font = "30px Arial";
    ctx.fillStyle = `rgba(255, 0, 0, ${Math.random() * 0.5 + 0.3})`; // Random opacity
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SIGN", 0, 0);
    ctx.restore();
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
        default:
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
    levelUpPopup.classList.add("slide-in");
    setTimeout(() => {
        levelUpPopup.classList.remove("slide-in");
        levelUpPopup.style.display = "none";
    }, 2000);
}

function gameOver() {
    isGameOver = true;
    gameOverSound.play();
    finalScoreDisplay.textContent = score;
    gameOverPopup.style.display = "flex";
    gameOverPopup.classList.add("fade-in");
    
    // Confetti effect
    confetti({
        ...confettiSettings,
        angle: 60,
        origin: { x: 0 }
    });
    confetti({
        ...confettiSettings,
        angle: 120,
        origin: { x: 1 }
    });
}

tryAgainButton.addEventListener("click", () => {
    gameOverPopup.classList.add("fade-out");
    setTimeout(() => {
        gameOverPopup.style.display = "none";
        gameOverPopup.classList.remove("fade-out");
        resetGame();
    }, 300);
});

shareButton.addEventListener("click", () => {
    const tweetText = `I scored ${score} points in SPOT THE SIGN 👀! Can you beat me? Play now: ${window.location.href}`;
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, "_blank");
});

canvas.addEventListener("click", (e) => {
    if (isGameOver) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if click is within the sign's bounding box
    if (clickX >= signX - signWidth / 2 && clickX <= signX + signWidth / 2 &&
        clickY >= signY - signHeight / 2 && clickY <= signY + signHeight / 2) {
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
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

// Initialize the game
console.log("Game initialized. Check for errors in the console.");
