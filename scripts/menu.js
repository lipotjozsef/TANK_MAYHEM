const canvas = document.getElementById('game_canvas');
const ctx = canvas.getContext('2d');

// meretek
canvas.width = 1080;
canvas.height = 720;
const gridCellSize = 72;
const buttonWidth = 200;
const buttonHeight = 50;
const buttonText = 'Start';
const imageSize = 350;
const logoSrc = 'assets/tankmayhem_logo.png';

let lobbyMusic = new Audio('assets/lobby_music.mp3'); 
lobbyMusic.loop = true; 
lobbyMusic.volume = 0.05; 

function startLobbyMusic() {
    lobbyMusic.currentTime = 0; // Reset the music to the beginning
    lobbyMusic.play().catch((error) => {
        console.error("Failed to play lobby music:", error);
    });
}

// Start music after user interaction
canvas.addEventListener('click', function startMusicOnInteraction() {
    startLobbyMusic();
    canvas.removeEventListener('click', startMusicOnInteraction); // Remove listener after starting music
});

function stopLobbyMusic() {
    lobbyMusic.pause();
    lobbyMusic.currentTime = 0; 
}

//--------mukodj bazdmeg----------
function run() {
    drawGrid(gridCellSize);
    const rows = Math.floor(canvas.height / gridCellSize);
    const cols = Math.floor(canvas.width / gridCellSize);
    const offsetX = (canvas.width - cols * gridCellSize) / 2;
    const offsetY = (canvas.height - rows * gridCellSize) / 2;

    drawCornerBoxes(offsetX, offsetY, cols, gridCellSize);
    drawCenterImage(images.logo, 400, 300); 
    drawSideButtons(buttonText);
    drawEndGameOptions();
}
//------------------------//


//----------------------------Grid----------------------------//
function drawGrid(cellSize) {
    const rows = Math.floor(canvas.height / cellSize);
    const cols = Math.floor(canvas.width / cellSize);
    const offsetX = (canvas.width - cols * cellSize) / 2;
    const offsetY = (canvas.height - rows * cellSize) / 2;

    drawGridLines(rows, cols, cellSize, offsetX, offsetY);
}
function drawGridLines(rows, cols, cellSize, offsetX, offsetY) {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    for (let i = 0; i <= rows; i++) {
        const y = offsetY + i * cellSize;
        drawLine(offsetX, y, offsetX + cols * cellSize, y);
    }

    for (let j = 0; j <= cols; j++) {
        const x = offsetX + j * cellSize;
        drawLine(x, offsetY, x, offsetY + rows * cellSize);
    }
}
function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
//-------------------------------------------------------------//


//---------------------Bal,jobb sarok (negyzetek)---------------------------//
function drawCornerBoxes(offsetX, offsetY, cols, cellSize) {
    const cornerSize = cellSize * 1.5; 

    drawLeftCornerBox(offsetX, offsetY, cornerSize, 'red', 'volume');
    drawRightCornerBox(offsetX + (cols - 1) * cellSize + cellSize, offsetY, cornerSize, 'blue', 'pause');

    addCornerBoxEventListeners(offsetX, offsetY, cols, cellSize, cornerSize);
}

function drawRightCornerBox(x, y, size, color, imageSrc) {
    drawCornerBox(x, y, size, color, imageSrc, true);
}

function drawLeftCornerBox(x, y, size, color, imageSrc) {
    drawCornerBox(x, y, size, color, imageSrc, false);
}

function addCornerBoxEventListeners(offsetX, offsetY, cols, cellSize, cornerSize) {
    leftBoxArea = {
        x: offsetX,
        y: offsetY,
        size: cornerSize,
    };

    rightBoxArea = {
        x: offsetX + (cols - 1) * cellSize + cellSize - cornerSize,
        y: offsetY,
        size: cornerSize,
    };
}

// ez az ami megrajzolja őket
function drawCornerBox(x, y, size, color, imageKey, isRight) {
    const radius = 30;

    ctx.fillStyle = color;
    ctx.beginPath();

    if (isRight) {
        ctx.moveTo(x, y);
        ctx.lineTo(x - size, y);
        ctx.lineTo(x - size, y + radius);
        ctx.lineTo(x - size, y + size - radius);
        ctx.quadraticCurveTo(x - size, y + size, x - size + radius, y + size);
        ctx.lineTo(x + radius, y + size);
        ctx.lineTo(x, y + size);
    } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x + size, y + radius);
        ctx.lineTo(x + size, y + size - radius);
        ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
        ctx.lineTo(x + radius, y + size);
        ctx.lineTo(x, y + size);
    }

    ctx.closePath();
    ctx.fill();

    const img = images[imageKey]; // Use the preloaded image
    if (img) {
        const imageScale = 0.8;
        const scaledSize = size * imageScale;

        const imageX = isRight ? x - scaledSize / 2 - size / 2 : x + size / 2 - scaledSize / 2;
        const imageY = y + size / 2 - scaledSize / 2;

        ctx.drawImage(img, imageX, imageY, scaledSize, scaledSize);
    }
}
//-------------------------------------------------------------//


//--------------------------Logo----------------------------------//
// Preload the logo image
const logoImage = new Image();
logoImage.src = logoSrc;

let logoY = canvas.height / 3; // Initial Y position of the logo
let isLogoAnimating = false; // Flag to prevent multiple animations

// Ensure the logo is drawn only after the image is loaded
logoImage.onload = () => {
    run(); // Start the initial rendering after the logo image is loaded
};

// Modify the drawCenterImage function to use the preloaded image
function drawCenterImage(image, width, height) {
    const centerX = canvas.width / 2;
    ctx.drawImage(image, centerX - width / 2 - 90, logoY - height / 2 - 10, width + 200, height);
}

// Create an offscreen canvas
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;
const offscreenCtx = offscreenCanvas.getContext('2d');

// Function to animate the logo upwards
function animateLogoUpwards() {
    if (isLogoAnimating) return; // Prevent multiple animations
    isLogoAnimating = true;

    function step() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        // Redraw everything
        drawGrid(gridCellSize);
        const rows = Math.floor(canvas.height / gridCellSize);
        const cols = Math.floor(canvas.width / gridCellSize);
        const offsetX = (canvas.width - cols * gridCellSize) / 2;
        const offsetY = (canvas.height - rows * gridCellSize) / 2;

        drawCornerBoxes(offsetX, offsetY, cols, gridCellSize); // Redraw corner boxes
        drawSideButtons(buttonText); // Redraw the green circle and wing boxes
        drawEndGameOptions(); // Redraw end game options

        // Update and draw the logo at its new position
        logoY -= 5; // Move the logo upwards
        drawCenterImage(images.logo, 400, 300);

        // Continue the animation if the logo is still visible
        if (logoY + 300 >= 0) {
            requestAnimationFrame(step); // Schedule the next frame
        }
    }

    requestAnimationFrame(step); // Start the animation
}

// Helper functions to draw to a specific context
function drawGridToContext(context, cellSize) {
    const rows = Math.floor(canvas.height / cellSize);
    const cols = Math.floor(canvas.width / cellSize);
    const offsetX = (canvas.width - cols * cellSize) / 2;
    const offsetY = (canvas.height - rows * cellSize) / 2;

    context.strokeStyle = 'black';
    context.lineWidth = 1;

    for (let i = 0; i <= rows; i++) {
        const y = offsetY + i * cellSize;
        drawLineToContext(context, offsetX, y, offsetX + cols * cellSize, y);
    }

    for (let j = 0; j <= cols; j++) {
        const x = offsetX + j * cellSize;
        drawLineToContext(context, x, offsetY, x, offsetY + rows * cellSize);
    }
}

function drawLineToContext(context, x1, y1, x2, y2) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

function drawCornerBoxesToContext(context, offsetX, offsetY, cols, cellSize) {
    const cornerSize = cellSize * 1.5;

    drawLeftCornerBoxToContext(context, offsetX, offsetY, cornerSize, 'red', 'volume');
    drawRightCornerBoxToContext(context, offsetX + (cols - 1) * cellSize + cellSize, offsetY, cornerSize, 'blue', 'pause');
}

function drawLeftCornerBoxToContext(context, x, y, size, color, imageSrc) {
    drawCornerBoxToContext(context, x, y, size, color, imageSrc, false);
}

function drawRightCornerBoxToContext(context, x, y, size, color, imageSrc) {
    drawCornerBoxToContext(context, x, y, size, color, imageSrc, true);
}

function drawCornerBoxToContext(context, x, y, size, color, imageSrc, isRight) {
    const radius = 30;

    context.fillStyle = color;
    context.beginPath();

    if (isRight) {
        context.moveTo(x, y);
        context.lineTo(x - size, y);
        context.lineTo(x - size, y + radius);
        context.lineTo(x - size, y + size - radius);
        context.quadraticCurveTo(x - size, y + size, x - size + radius, y + size);
        context.lineTo(x + radius, y + size);
        context.lineTo(x, y + size);
    } else {
        context.moveTo(x, y);
        context.lineTo(x + size, y);
        context.lineTo(x + size, y + radius);
        context.lineTo(x + size, y + size - radius);
        context.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
        context.lineTo(x + radius, y + size);
        context.lineTo(x, y + size);
    }

    context.closePath();
    context.fill();

    const img = images[imageSrc];
    if (img) {
        const imageScale = 0.8;
        const scaledSize = size * imageScale;

        const imageX = isRight ? x - scaledSize / 2 - size / 2 : x + size / 2 - scaledSize / 2;
        const imageY = y + size / 2 - scaledSize / 2;

        context.drawImage(img, imageX, imageY, scaledSize, scaledSize);
    }
}

function drawSideButtonsToContext(context, text) {
    // Implement similar to drawSideButtons but draw to the provided context
}

function drawEndGameOptionsToContext(context) {
    // Implement similar to drawEndGameOptions but draw to the provided context
}

function drawCenterImageToContext(context, image, width, height) {
    const centerX = canvas.width / 2;
    context.drawImage(image, centerX - width / 2 - 90, logoY - height / 2 - 10, width + 200, height);
}
//------------------------------------------------------------//


//-------------------------Also gombok----------------------------// 
function drawButton(x, y, width, height, text, bgColor = 'black', textColor = 'white', isCircular = false) {
    ctx.fillStyle = bgColor;

    if (isCircular) {
        
        const radius = width / 2;
        ctx.beginPath();
        ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.fillRect(x, y, width, height);
    }

    ctx.fillStyle = textColor; 
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (isCircular) {
        ctx.fillText(text, x + width / 2, y + width / 2);
    } else {
        ctx.fillText(text, x + width / 2, y + height / 2);
    }
}

//nyilak megrajzolása
function drawArrow(x, y, width, height, direction) {
    ctx.fillStyle = 'black';
    ctx.beginPath();

    if (direction === 'left') {
        ctx.moveTo(x + width, y - height / 2);
        ctx.lineTo(x, y);
        ctx.lineTo(x + width, y + height / 2);
    } else if (direction === 'right') {
        ctx.moveTo(x, y - height / 2);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x, y + height / 2);
    }

    ctx.closePath();
    ctx.fill();
}

//Felso gombok (Start, 1P, 2P)
function drawSideButtons(text) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 65;

    const startButtonSize = 100;
    const wingButtonWidth = 100;
    const wingButtonHeight = startButtonSize;
    const wingOverlap = -10;

    // Draw the green circular border
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(centerX, centerY, startButtonSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    // Draw the controller image from the preloaded images
    const startButtonImage = images.controller; // Use preloaded image
    if (startButtonImage) {
        const imageSize = startButtonSize * 0.8;
        ctx.drawImage(
            startButtonImage,
            centerX - imageSize / 2,
            centerY - imageSize / 2,
            imageSize,
            imageSize
        );
    }

    // Draw the left wing box (1P)
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(centerX - startButtonSize / 2 - wingOverlap, centerY - wingButtonHeight / 2);
    ctx.lineTo(centerX - startButtonSize / 2 - wingButtonWidth - wingOverlap, centerY - wingButtonHeight / 2);
    ctx.lineTo(centerX - startButtonSize / 2 - wingButtonWidth - wingOverlap, centerY + wingButtonHeight / 2);
    ctx.arc(
        centerX - startButtonSize / 2 - wingOverlap + 40,
        centerY,
        wingButtonHeight / 2,
        Math.PI / 2,
        -Math.PI / 2,
        false
    );
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        '1P',
        centerX - startButtonSize / 2 - wingButtonWidth / 2,
        centerY
    );

    // Store the clickable area for the "1P" button
    onePButtonArea = {
        x: centerX - startButtonSize / 2 - wingButtonWidth - wingOverlap,
        y: centerY - wingButtonHeight / 2,
        width: wingButtonWidth,
        height: wingButtonHeight,
    };

    // Draw the right wing box (2P)
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(centerX + startButtonSize / 2 + wingOverlap, centerY - wingButtonHeight / 2);
    ctx.lineTo(centerX + startButtonSize / 2 + wingButtonWidth + wingOverlap, centerY - wingButtonHeight / 2);
    ctx.lineTo(centerX + startButtonSize / 2 + wingButtonWidth + wingOverlap, centerY + wingButtonHeight / 2);
    ctx.arc(
        centerX + startButtonSize / 2 + wingOverlap - 40,
        centerY,
        wingButtonHeight / 2,
        Math.PI / 2,
        -Math.PI / 2,
        true
    );
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        '2P',
        centerX + startButtonSize / 2 + wingButtonWidth / 2,
        centerY
    );

    // Store the clickable area for the "2P" button
    twoPButtonArea = {
        x: centerX + startButtonSize / 2 + wingOverlap,
        y: centerY - wingButtonHeight / 2,
        width: wingButtonWidth,
        height: wingButtonHeight,
    };
}

let onePButtonArea = {};
let twoPButtonArea = {};

//nyilak + end score gomb
let selectedNumber = 5; 
let onNumberChange = null; 

// Define arrow areas globally
let leftArrowArea = {};
let rightArrowArea = {};

// Define the click handler
function handleEndGameClick(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (
        mouseX >= leftArrowArea.x &&
        mouseX <= leftArrowArea.x + leftArrowArea.width &&
        mouseY >= leftArrowArea.y &&
        mouseY <= leftArrowArea.y + leftArrowArea.height
    ) {
        if (selectedNumber > 1) {
            selectedNumber--;
            drawEndGameOptions(); // Redraw the options
            if (onNumberChange) onNumberChange(selectedNumber);
        }
    }

    if (
        mouseX >= rightArrowArea.x &&
        mouseX <= rightArrowArea.x + rightArrowArea.width &&
        mouseY >= rightArrowArea.y &&
        mouseY <= rightArrowArea.y + rightArrowArea.height
    ) {
        if (selectedNumber < 10) {
            selectedNumber++;
            drawEndGameOptions(); // Redraw the options
            if (onNumberChange) onNumberChange(selectedNumber);
        }
    }
}

function setOnNumberChange(callback) {
    onNumberChange = callback; 
}

function getSelectedNumber() {
    return selectedNumber; 
}

function drawEndGameOptions() {
    const x = (canvas.width - buttonWidth) / 2;
    const y = (canvas.height - buttonHeight) / 2 + 160;

    // Draw the buttons and arrows
    drawButton(x, y, buttonWidth, buttonHeight, 'End Score');
    drawButton(x + 25, y + 60, buttonWidth - 50, buttonHeight, selectedNumber.toString());

    const arrowWidth = 40;
    const arrowHeight = 20;
    const spacing = 20;

    // Calculate arrow areas
    leftArrowArea = {
        x: x - arrowWidth - spacing + 20,
        y: y + buttonHeight / 2 + 60 - arrowHeight / 2,
        width: arrowWidth,
        height: arrowHeight,
    };

    rightArrowArea = {
        x: x + buttonWidth + spacing - 20,
        y: y + buttonHeight / 2 + 60 - arrowHeight / 2,
        width: arrowWidth,
        height: arrowHeight,
    };

    drawArrow(leftArrowArea.x, leftArrowArea.y + arrowHeight / 2, arrowWidth, arrowHeight, 'left');
    drawArrow(rightArrowArea.x, rightArrowArea.y + arrowHeight / 2, arrowWidth, arrowHeight, 'right');

    // Ensure the click event listener is added only once
    canvas.removeEventListener('click', handleEndGameClick); // Remove any existing listener
    canvas.addEventListener('click', handleEndGameClick); // Add the listener
}

setOnNumberChange((newNumber) => {
    console.log(`Selected number changed to: ${newNumber}`);
});

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Handle "Start Game" button click
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 65;
    const startButtonSize = 100;
    const distance = Math.sqrt(
        Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
    );

    if (distance <= startButtonSize / 2) {
        console.log("Start Game button pressed");
        animateLogoUpwards(); // Trigger the logo animation
        return; // Exit early to avoid triggering other buttons
    }

    // Handle "1P" button click
    if (
        mouseX >= onePButtonArea.x &&
        mouseX <= onePButtonArea.x + onePButtonArea.width &&
        mouseY >= onePButtonArea.y &&
        mouseY <= onePButtonArea.y + onePButtonArea.height
    ) {
        console.log("1P button clicked");
        // Add logic for 1P button click
        return;
    }

    // Handle "2P" button click
    if (
        mouseX >= twoPButtonArea.x &&
        mouseX <= twoPButtonArea.x + twoPButtonArea.width &&
        mouseY >= twoPButtonArea.y &&
        mouseY <= twoPButtonArea.y + twoPButtonArea.height
    ) {
        console.log("2P button clicked");
        // Add logic for 2P button click
        return;
    }

    // Handle "Mute/Volume" button click
    if (
        mouseX >= leftBoxArea.x &&
        mouseX <= leftBoxArea.x + leftBoxArea.size &&
        mouseY >= leftBoxArea.y &&
        mouseY <= leftBoxArea.y + leftBoxArea.size
    ) {
        isLeftBoxToggled = !isLeftBoxToggled;
        drawLeftCornerBox(
            leftBoxArea.x,
            leftBoxArea.y,
            leftBoxArea.size,
            'red',
            isLeftBoxToggled ? 'mute' : 'volume'
        );

        if (isLeftBoxToggled) {
            lobbyMusic.muted = true;
            console.log("Sound currently muted");
        } else {
            lobbyMusic.muted = false;
            console.log("Sound currently on");
        }
        return;
    }

    // Handle "Play/Pause" button click
    if (
        mouseX >= rightBoxArea.x &&
        mouseX <= rightBoxArea.x + rightBoxArea.size &&
        mouseY >= rightBoxArea.y &&
        mouseY <= rightBoxArea.y + rightBoxArea.size
    ) {
        isRightBoxToggled = !isRightBoxToggled;
        drawRightCornerBox(
            rightBoxArea.x + gridCellSize * 1.5,
            rightBoxArea.y,
            rightBoxArea.size,
            'blue',
            isRightBoxToggled ? 'play' : 'pause'
        );

        if (isRightBoxToggled) {
            console.log("Game on pause");
        } else {
            console.log("Game is playing");
        }
        return;
    }
});

const images = {};

function preloadImages(imageSources, callback) {
    let loadedImages = 0;
    const totalImages = Object.keys(imageSources).length;

    for (const [key, src] of Object.entries(imageSources)) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loadedImages++;
            if (loadedImages === totalImages) {
                callback(); // All images are loaded
            }
        };
        images[key] = img;
    }
}

const imageSources = {
    logo: 'assets/tankmayhem_logo.png',
    volume: 'assets/volume.png',
    mute: 'assets/mute.png',
    pause: 'assets/pause.png',
    play: 'assets/play-button.png', // Correct key for the Play image
    controller: 'assets/controller.png',
};

preloadImages(imageSources, () => {
    console.log('All images loaded');
    run(); // Start the initial rendering
});

let isLeftBoxToggled = false; // Tracks the state of the left box (mute/volume)
let isRightBoxToggled = false; // Tracks the state of the right box (play/pause)

run(); 
startLobbyMusic();
