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
let level = "Easy";
let timeLeft = 0;
let timerInterval;
let signX, signY, signWidth, signHeight;
let currentImageIndex = 0;
let images = [];

// Image Paths
const imagePaths = {
    Easy: ["./images/easy1.jpg", "./images/easy2.jpg", "./images/easy3.jpg"],
    Medium: ["./images/medium1.jpg", "./images/medium2.jpg", "./images/medium3.jpg"],
    Hard: ["./images/hard1.jpg", "./images/hard2.jpg", "./images/hard3.jpg"],
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
                alert(`Time's up! Final Score: ${score}`);
                resetGame();
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
    // Define font size and styles based on the level
    let fontSize;
    switch (level) {
        case "Easy":
            fontSize = 50;
            break;
        case "Medium":
            fontSize = 40;
            break;
        case "Hard":
            fontSize = 30;
            break;
        case "Extremely Hard":
            fontSize = 20;
            break;
        default:
            fontSize = 30;
    }

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "red";

    // Randomize position of "SIGN" within canvas boundaries
    signX = Math.random() * (canvas.width - fontSize * 2); // Leave some padding
    signY = Math.random() * (canvas.height - fontSize);
    ctx.fillText("SIGN", signX, signY);

    // Set sign dimensions
    signWidth = ctx.measureText("SIGN").width;
    signHeight = fontSize; // Match the font size for height
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Adjust collision detection to ensure it matches the "SIGN" position
    if (
        clickX >= signX &&
        clickX <= signX + signWidth &&
        clickY >= signY &&
        clickY <= signY + signHeight
    ) {
        // Add points based on level
        score += POINTS_PER_LEVEL[level];
        updateScore();

        // Handle level progression
        if (level !== "Extremely Hard" && currentImageIndex >= images.length) {
            advanceLevel();
        }

        // Reset timer for timed levels
        if (level !== "Easy") {
            timeLeft = TIMER_PER_LEVEL[level];
        }

        // Load next image
        loadNextImage();
    }
});


function triggerDestructionMode() {
    // Add emojis or effects for destruction mode
    const emojis = ["💥", "🔥", "💣", "🌋", "⚡"];
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.font = "40px Arial";
        ctx.fillText(emojis[Math.floor(Math.random() * emojis.length)], x, y);
    }
}

function updateScore() {
    scoreDisplay.textContent = score;
}

function resetGame() {
    clearInterval(timerInterval);
    showScreen("welcome");
}

// Initialize the game
console.log("Game initialized. Check for errors in the console.");
