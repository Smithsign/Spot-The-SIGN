const screens = {
    welcome: document.getElementById("welcome-screen"),
    nameForm: document.getElementById("name-form-screen"),
    signeeOptions: document.getElementById("signee-options"),
    introduceSign: document.getElementById("introduce-sign"),
    gameContainer: document.getElementById("game-container"),
};

const buttons = {
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
const signaturePaper = document.getElementById("signature-paper");
const signatureText = document.getElementById("signature-text");


let playerName = "";
let score = 0;
let level = "Easy";
let timeLeft = 0;
let timerInterval;
let signX, signY, signWidth, signHeight;
let currentImageIndex = 0;
let images = [];
let isGameOver = false;
let signSize = 30; // Initial font size for the sign text
let duplicateCount = 0; // Counter for duplicate images in Extremely Hard level


const imagePaths = {
    Easy: ["./images/easy1.jpg", "./images/easy2.jpg", "./images/easy3.jpg", "./images/easy4.jpg", "./images/easy5.jpg"],
    Medium: ["./images/medium1.jpg", "./images/medium2.jpg", "./images/medium3.jpg", "./images/medium4.jpg", "./images/medium5.jpg", "./images/medium6.jpg"],
    Hard: [
        "./images/hard1.jpg", "./images/hard2.jpg", "./images/hard3.jpg", "./images/hard4.jpg",
        "./images/hard5.jpg", "./images/hard6.jpg", "./images/hard7.jpg", "./images/hard8.jpg",
        "./images/hard9.jpg", "./images/hard10.jpg", "./images/hard11.jpg", "./images/hard12.jpg",
        "./images/hard13.jpg", "./images/hard14.jpg", "./images/hard15.jpg", "./images/hard16.jpg"
    ],
    "Extremely Hard": ["./images/extremely-hard.jpg"],
};


const POINTS_PER_LEVEL = {
    Easy: 1,
    Medium: 5,
    Hard: 15,
    "Extremely Hard": 20,
};


const TIMER_PER_LEVEL = {
    Easy: 0,
    Medium: 20,
    Hard: 15,
    "Extremely Hard": 10,
};


const clickSound = new Audio("./sounds/click.wav"); // Changed from .mp3 to .wav
const gameOverSound = new Audio("./sounds/game-over.wav"); // Changed from .mp3 to .wav


const confettiSettings = { 
    particleCount: 100, 
    spread: 70, 
    origin: { y: 0.6 }, 
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
};


document.addEventListener("DOMContentLoaded", () => {
    console.log("Game initialized. Check for errors in the console.");

  
    showScreen("welcome");


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

    tryAgainButton.addEventListener("click", () => {
        gameOverPopup.classList.add("fade-out");
        setTimeout(() => {
            gameOverPopup.style.display = "none";
            gameOverPopup.classList.remove("fade-out");
            startGame(); // Restart the game directly
        }, 300);
    });

    shareButton.addEventListener("click", () => {
        const tweetText = `I scored ${score} points in SPOT THE SIGN 👀! Can you beat me? Play now: ${window.location.href}`;
        const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(tweetUrl, "_blank");
    });

  
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("touchstart", handleCanvasTouch, { passive: false });

    function handleCanvasClick(e) {
        if (isGameOver) return;

        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        checkClick(clickX, clickY);
    }

    function handleCanvasTouch(e) {
        if (isGameOver) return;

        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;

        checkClick(touchX, touchY);
    }

    function checkClick(x, y) {
        if (x >= signX - signWidth / 2 && x <= signX + signWidth / 2 &&
            y >= signY - signHeight / 2 && y <= signY + signHeight / 2) {
            clickSound.play();
            score += POINTS_PER_LEVEL[level];
            updateScore();

            if (level === "Extremely Hard") {
              
                duplicateCount++;
                signSize = Math.max(10, signSize - 5); 
                if (duplicateCount % 2 === 0) {
                    loadNextImage(); 
                }
            } else if (level !== "Extremely Hard" && currentImageIndex >= images.length) {
                advanceLevel();
            }

            if (level !== "Easy") {
                timeLeft = TIMER_PER_LEVEL[level];
            }

            loadNextImage();
        }
    }
});


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
    greeting.textContent = `Goodluck, ${playerName}! 
    🧡👁👅👁🧡`;

    
    const aspectRatio = 4 / 3;
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.6;
    const canvasWidth = Math.min(maxWidth, maxHeight * aspectRatio);
    const canvasHeight = canvasWidth / aspectRatio;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    score = 0;
    level = "Easy";
    timeLeft = TIMER_PER_LEVEL[level];
    images = imagePaths[level];
    currentImageIndex = 0;
    signSize = 30; // Reset sign size
    duplicateCount = 0; // Reset duplicate count
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
                showAnswerAndGameOver();
            }
        }, 1000);
    }
}

function loadNextImage() {
    if (currentImageIndex >= images.length) {
        alert("CONGRATULATIONS! You completed the level.");
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
    ctx.font = `${signSize}px Arial`;
    ctx.fillStyle = getSignColor(); // Dynamic color based on level
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SIGN", 0, 0);
    ctx.restore();
}

function getSignColor() {
    const imageData = ctx.getImageData(signX, signY, 1, 1).data;
    const baseOpacity = getBaseOpacityForLevel();
    if (level === "Easy") {
        return "rgba(255, 0, 0, 1)"; 
    }
    return `rgba(${imageData[0]}, ${imageData[1]}, ${imageData[2]}, ${baseOpacity})`;
}

function getBaseOpacityForLevel() {
    switch (level) {
        case "Easy":
            return 1; // Super duper visible
        case "Medium":
            return 0.8; // Slightly blended
        case "Hard":
            return 0.5; // Mostly blended
        case "Extremely Hard":
            return 0.1; // Almost invisible
        default:
            return 1;
    }
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

function showAnswerAndGameOver() {
   
    ctx.beginPath();
    ctx.arc(signX, signY, signWidth / 2 + 10, 0, 2 * Math.PI); 
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.stroke();

    
    animateSignText();

    
    setTimeout(() => {
        gameOver();
    }, 2000);
}

function animateSignText() {
    let opacity = getBaseOpacityForLevel();
    const targetOpacity = 1;
    const duration = 1000; 
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentOpacity = opacity + (targetOpacity - opacity) * progress;

        ctx.clearRect(signX - signWidth / 2, signY - signHeight / 2, signWidth, signHeight);
        ctx.save();
        ctx.translate(signX, signY);
        ctx.rotate((Math.random() - 0.5) * 0.5);
        ctx.font = `${signSize}px Arial`;
        ctx.fillStyle = `rgba(255, 0, 0, ${currentOpacity})`; 
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("SIGN", 0, 0);
        ctx.restore();

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

function animateSignature() {
   
    const signaturePaper = document.getElementById("signature-paper");
    signaturePaper.style.display = "block";
    signaturePaper.classList.add("slide-in");

    
    const signatureText = document.getElementById("signature-text");
    signatureText.textContent = "";

  
    const text = "~xoxo, sign smith";
    let index = 0;

    
    const interval = setInterval(() => {
        if (index < text.length) {
            signatureText.textContent += text[index];
            index++;
        } else {
            clearInterval(interval); 
        }
    }, 200); 
}

function gameOver() {
    isGameOver = true;
    gameOverSound.play();
    finalScoreDisplay.textContent = score;
    gameOverPopup.style.display = "flex";
    gameOverPopup.classList.add("fade-in");

   
    animateSignature();

 
    confetti({
        particleCount: 100, 
        spread: 70, 
        origin: { y: 0.6 }, 
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'] 
    });

  
    confetti({
        particleCount: 100,
        spread: 70,
        angle: 60, 
        origin: { x: 0 } 
    });

    confetti({
        particleCount: 100,
        spread: 70,
        angle: 120, 
        origin: { x: 1 } 
    });
}

function resetGame() {
    clearInterval(timerInterval);
    showScreen("welcome");
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}
