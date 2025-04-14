import { start, mainLoop } from "./player_controller.js";
const canvas = document.getElementById('game_canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1080;
canvas.height = 720;
const logoSrc = 'assets/tankmayhem_logo2.png';
let lobbyMusic = new Audio('assets/lobby_music.mp3'); // Replace with your lobby music file path

const hoverSound2P = new Audio('assets/two_players.m4a'); // Replace with your 2P sound file path
const hoverSound3P = new Audio('assets/three_players.m4a'); // Replace with your 3P sound file patheplace with your sound file path

//Képek/assetek forrásai
const imageSources = {
    logo: 'assets/tankmayhem_logo2.png',
    volume: 'assets/volume.png',
    mute: 'assets/mute.png',
    pause: 'assets/pause.png',
    play: 'assets/play-button.png',
    controller: 'assets/controller.png',
};





//---------------------Változók---------------------//
let hideMenu = false;
let playercount = 2; 
let rightBoxArea;
let leftBoxArea;
let isLeftBoxToggled = false;
let isRightBoxToggled = false;
let isAnimating = false; 
let leftBoxX = 0;
let rightBoxX = canvas.width;
let leftButtonX, rightButtonX;
let isStartButtonPressed = false;

let rotationAngle = 0; // Current rotation angle
let rotationDirection = 1; // 1 for clockwise, -1 for counterclockwise
const maxRotationAngle = 10; // Maximum tilt angle in degrees
const rotationSpeed = 0.5; // Speed of rotation




//---------------------Lobby zene---------------------//

lobbyMusic.loop = true;
lobbyMusic.volume = 0.05;

function startLobbyMusic() {
    lobbyMusic.currentTime = 0;
    lobbyMusic.play().catch((error) => {
        console.error("Failed to play lobby music:", error);
    });
}

canvas.addEventListener('click', function startMusicOnInteraction() {
    startLobbyMusic();
    canvas.removeEventListener('click', startMusicOnInteraction);
});





//----------------------------Grid----------------------------//
const gridCellSize = 72;

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

    const img = images[imageKey];
    if (img) {
        const imageScale = 0.8;
        const scaledSize = size * imageScale;

        const imageX = isRight ? x - scaledSize / 2 - size / 2 : x + size / 2 - scaledSize / 2;
        const imageY = y + size / 2 - scaledSize / 2;

        ctx.drawImage(img, imageX, imageY, scaledSize, scaledSize);
    }
}





//--------------------------Logo----------------------------------//
const logoImage = new Image();
logoImage.src = logoSrc;

let logoY = canvas.height / 3;
let isLogoAnimating = false;

logoImage.onload = () => {
    drawCenterImage(logoImage, 400, 300);
};

function drawCenterImage(image, width, height) {
    const centerX = canvas.width / 2;
    ctx.drawImage(image, centerX - width / 2 - 100, logoY - height / 2 - 80, width + 200, height + 50);
}

const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;





//-------------------------End score options----------------------------// 

const buttonWidth = 200;
const buttonHeight = 50;

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
        '2P',
        centerX - startButtonSize / 2 - wingButtonWidth / 2,
        centerY
    );

    onePButtonArea = {
        x: centerX - startButtonSize / 2 - wingButtonWidth - wingOverlap,
        y: centerY - wingButtonHeight / 2,
        width: wingButtonWidth,
        height: wingButtonHeight,
    };

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
        '3P',
        centerX + startButtonSize / 2 + wingButtonWidth / 2,
        centerY
    );

    twoPButtonArea = {
        x: centerX + startButtonSize / 2 + wingOverlap,
        y: centerY - wingButtonHeight / 2,
        width: wingButtonWidth,
        height: wingButtonHeight,
    };
}

let onePButtonArea = {};
let twoPButtonArea = {};

let selectedNumber = 5; 
let onNumberChange = null; 

let leftArrowArea = {};
let rightArrowArea = {};





//----------------Click és change funkciók------------------//
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

let endScoreMenuY = canvas.height / 2 + 160; 

function drawEndGameOptions(yPosition = canvas.height / 2 + 160) {
    const x = (canvas.width - buttonWidth) / 2;
    const y = yPosition; // Use the passed Y position

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

    canvas.removeEventListener('click', handleEndGameClick); // Remove any existing listener
    canvas.addEventListener('click', handleEndGameClick); // Add the listener
}

setOnNumberChange((newNumber) => {
    console.log(`Selected number changed to: ${newNumber}`);
});

function showMenus() {
    const leftMenu = document.getElementById('leftmenu');
    const rightMenu = document.getElementById('rightmenu');

    leftMenu.classList.add('visible'); // Add the "visible" class to trigger animation
    rightMenu.classList.add('visible');
}

function showBottomMenu() {
    const bottomMenu = document.getElementById('bottommenu');
    bottomMenu.classList.add('visible'); // Add the "visible" class to trigger animation
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 65;
    const startButtonSize = 100;
    const distance = Math.sqrt(
        Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
    );

    if (distance <= startButtonSize / 2) {
        if (isStartButtonPressed) {
            console.log("Start button already pressed");
            return; // Ignore further presses
        }

        isStartButtonPressed = true; // Set the flag to true
        console.log("Start Game button pressed");

        initializeAnimationVariables();
        isAnimating = true;
        animate();
        setTimeout(() => {
            hideMenu = true;
            showMenus(); // Show the left and right menus with animation
            if (playercount === 3) {
                showBottomMenu(); // Show the bottom menu if playercount is 3
            }
            start(playercount);
            mainLoop();
        }, 3000);
        return;
    }
});

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (
        onePButtonArea &&
        mouseX >= onePButtonArea.x &&
        mouseX <= onePButtonArea.x + onePButtonArea.width &&
        mouseY >= onePButtonArea.y &&
        mouseY <= onePButtonArea.y + onePButtonArea.height
    ) {
        playercount = 2
        console.log(`playercount: ${playercount}`);
    }

    if (
        twoPButtonArea &&
        mouseX >= twoPButtonArea.x &&
        mouseX <= twoPButtonArea.x + twoPButtonArea.width &&
        mouseY >= twoPButtonArea.y &&
        mouseY <= twoPButtonArea.y + twoPButtonArea.height
    ) {
        playercount = 3
        console.log(`playercount: ${playercount}`);
    }

    if (
        leftBoxArea &&
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

    if (
        rightBoxArea &&
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

let isHovering2P = false; // Track hover state for 2P button
let isHovering3P = false; // Track hover state for 3P button

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check if mouse is over the 2P button
    if (
        onePButtonArea &&
        mouseX >= onePButtonArea.x &&
        mouseX <= onePButtonArea.x + onePButtonArea.width &&
        mouseY >= onePButtonArea.y &&
        mouseY <= onePButtonArea.y + onePButtonArea.height
    ) {
        if (!isHovering2P) {
            hoverSound2P.currentTime = 0; // Reset sound to the beginning
            hoverSound2P.play();
            isHovering2P = true;
        }
    } else {
        isHovering2P = false; // Reset hover state when mouse leaves
    }

    // Check if mouse is over the 3P button
    if (
        twoPButtonArea &&
        mouseX >= twoPButtonArea.x &&
        mouseX <= twoPButtonArea.x + twoPButtonArea.width &&
        mouseY >= twoPButtonArea.y &&
        mouseY <= twoPButtonArea.y + twoPButtonArea.height
    ) {
        if (!isHovering3P) {
            hoverSound3P.currentTime = 0; // Reset sound to the beginning
            hoverSound3P.play();
            isHovering3P = true;
        }
    } else {
        isHovering3P = false; // Reset hover state when mouse leaves
    }
});





//-------------------------Képek/assetek----------------------------//
const images = {};
const buttonText = 'Start';

//Képek/assetek előre betöltése
function preloadImages(imageSources, callback) {
    let loadedImages = 0;
    const totalImages = Object.keys(imageSources).length;

    for (const [key, src] of Object.entries(imageSources)) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loadedImages++;
            if (loadedImages === totalImages) {
                callback(); 
            }
        };
        images[key] = img;
    }
}

//A function meghívása
preloadImages(imageSources, () => {
    console.log('All images loaded');
    run();
});





//-------------------------Animáció----------------------------//
//Animáláshoz szüksgéges változók megadása
function initializeAnimationVariables() {
    const centerX = canvas.width / 2;
    const startButtonSize = 100;
    const wingButtonWidth = 150;
    const wingOverlap = -10;

    leftButtonX = centerX - startButtonSize / 2 - wingButtonWidth - wingOverlap + 50;
    rightButtonX = centerX + startButtonSize / 2 + wingOverlap + 100;
}

//Animáláért felelős function(gecinagy)
function animate() {
    if (!isAnimating) return;

    const animationSpeed = 5;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(gridCellSize);
    const rows = Math.floor(canvas.height / gridCellSize);
    const cols = Math.floor(canvas.width / gridCellSize);
    const offsetX = (canvas.width - cols * gridCellSize) / 2;
    const offsetY = (canvas.height - rows * gridCellSize) / 2;

    if (leftBoxX + leftBoxArea.size > 0) {
        leftBoxX -= animationSpeed;
        drawLeftCornerBox(leftBoxX, leftBoxArea.y, leftBoxArea.size, 'red', 'volume');
    }

    if (rightBoxX - rightBoxArea.size < canvas.width) {
        rightBoxX += animationSpeed;
        drawRightCornerBox(rightBoxX, rightBoxArea.y, rightBoxArea.size, 'blue', 'pause');
    }

    drawEndGameOptions(endScoreMenuY); 

    if (logoY + 300 >= 0) {
        logoY -= animationSpeed;
    }
    drawCenterImage(images.logo, 400, 300);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 65;
    const startButtonSize = 100;
    const wingButtonWidth = 150;
    const wingButtonHeight = startButtonSize;
    const wingOverlap = -10;

    if (leftButtonX > -wingButtonWidth * 2) {
        leftButtonX -= animationSpeed;
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(centerX - startButtonSize / 2 - wingOverlap, centerY - wingButtonHeight / 2);
        ctx.lineTo(leftButtonX, centerY - wingButtonHeight / 2);
        ctx.lineTo(leftButtonX, centerY + wingButtonHeight / 2);
        ctx.arc(
            leftButtonX + wingButtonWidth,
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
        ctx.fillText('2P', leftButtonX + wingButtonWidth / 2, centerY);
    }

    if (rightButtonX < canvas.width + wingButtonWidth * 2) {
        rightButtonX += animationSpeed;
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(centerX + startButtonSize / 2 + wingOverlap, centerY - wingButtonHeight / 2);
        ctx.lineTo(rightButtonX, centerY - wingButtonHeight / 2);
        ctx.lineTo(rightButtonX, centerY + wingButtonHeight / 2);
        ctx.arc(
            rightButtonX - wingButtonWidth,
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
        ctx.fillText('3P', rightButtonX - wingButtonWidth / 2, centerY);
    }

    if (endScoreMenuY < canvas.height ) { 
        endScoreMenuY += animationSpeed;
    }


    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(centerX, centerY, startButtonSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    const startButtonImage = images.controller; 
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

    if (
        logoY + 300 < 0 &&
        leftBoxX + leftBoxArea.size <= 0 &&
        rightBoxX - rightBoxArea.size >= canvas.width &&
        leftButtonX <= -wingButtonWidth * 2 &&
        rightButtonX >= canvas.width + wingButtonWidth * 2 &&
        endScoreMenuY >= canvas.height - 100
    ) {
        isAnimating = false; 

        leftBoxArea = null;
        rightBoxArea = null;
        onePButtonArea = null;
        twoPButtonArea = null;

        return;
    }
    drawCenterImage(images.logo, 400, 300);

    if(!hideMenu)requestAnimationFrame(animate);
}





//--------(Run függvény)----------
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





//--------------------Futtatás-------------------//
run();
startLobbyMusic();