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
let timeLeft = 0; // Initialize to 0
let timerInterval;
let signX, signY, signWidth, signHeight;
let currentImageIndex = 0;
let images = [];
let clonedImages = []; // For extremely hard level

// Image Paths
// Image Paths
const imagePaths = {
    Easy: [
        "./images/easy1.jpg",
        "./images/easy2.jpg",
        "./images/easy3.jpg",
        "./images/easy4.jpg",
        "./images/easy5.jpg",
    ],
    Medium: [
        "./images/medium1.jpg",
        "./images/medium2.jpg",
        "./images/medium3.jpg",
        "./images/medium4.jpg",
        "./images/medium5.jpg",
        "./images/medium6.jpg",
    ],
    Hard: [
        "./images/hard1.jpg",
        "./images/hard2.jpg",
        "./images/hard3.jpg",
        "./images/hard4.jpg",
        "./images/hard5.jpg",
        "./images/hard6.jpg",
        "./images/hard7.jpg",
        "./images/hard8.jpg",
        "./images/hard9.jpg",
        "./images/hard10.jpg",
        "./images/hard11.jpg",
        "./images/hard12.jpg",
        "./images/hard13.jpg",
        "./images/hard14.jpg",
        "./images/hard15.jpg",
        "./images/hard16.jpg",
    ],
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
    Easy: 0, // No timer
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
    Object.values(screens).forEach((s) => (s.style.display = "none"));
    screens[screen].style.display = "flex";
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

function updateTimer() {
    timerDisplay.textContent = `Time: ${timeLeft}s`;
}

function loadNextImage() {
    if (level === "Extremely Hard") {
        // Clone the image for extremely hard level
        const img = new Image();
        img.src = imagePaths["Extremely Hard"][0];
        clonedImages.push(img);
    } else {
        // Load the next image for other levels
        const img = new Image();
        img.src = images[currentImageIndex];
        currentImageIndex++;
    }

    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (level === "Extremely Hard") {
            // Draw all cloned images
            clonedImages.forEach((clone, index) => {
                ctx.drawImage(clone, index * 50, index * 50, canvas.width, canvas.height);
            });
        } else {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        renderSign();
    };

    img.onerror = () => {
        console.error("Failed to load image. Check the file path and name.");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText("Image not found! Check the file path.", 50, 50);
    };
}

function renderSign() {
    // Adjust SIGN size and position based on level difficulty
    let fontSize, textColor;
    switch (level) {
        case "Easy":
            fontSize = 50;
            textColor = "yellow";
            break;
        case "Medium":
            fontSize = 40;
            textColor = "orange";
            break;
        case "Hard":
            fontSize = 30;
            textColor = "red";
            break;
        case "Extremely Hard":
            fontSize = 20;
            textColor = "white";
            break;
    }

    signX = Math.random() * (canvas.width - 100);
    signY = Math.random() * (canvas.height - 50);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = textColor;
    ctx.fillText("SIGN", signX, signY);
    signWidth = ctx.measureText("SIGN").width;
    signHeight = fontSize;
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

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (clickX > signX && clickX < signX + signWidth && clickY > signY - signHeight && clickY < signY) {
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
