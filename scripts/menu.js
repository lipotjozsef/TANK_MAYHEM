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

//--------mukodj bazdmeg----------
function run() {
    drawGrid(gridCellSize);
    const rows = Math.floor(canvas.height / gridCellSize);
    const cols = Math.floor(canvas.width / gridCellSize);
    const offsetX = (canvas.width - cols * gridCellSize) / 2;
    const offsetY = (canvas.height - rows * gridCellSize) / 2;

    drawCornerBoxes(offsetX, offsetY, cols, gridCellSize);
    drawCenterImage(logoSrc, 400, 300); 
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
    const cornerSize = cellSize * 1.5; // Adjust this value to change the size of the corner boxes

    drawLeftCornerBox(offsetX, offsetY, cornerSize, 'red', 'assets/volume.png');
    drawRightCornerBox(offsetX + (cols - 1) * cellSize + cellSize, offsetY, cornerSize, 'blue', 'assets/pause.png');

    addCornerBoxEventListeners(offsetX, offsetY, cols, cellSize, cornerSize);
}

function drawRightCornerBox(x, y, size, color, imageSrc) {
    drawCornerBox(x, y, size, color, imageSrc, true);
}

function drawLeftCornerBox(x, y, size, color, imageSrc) {
    drawCornerBox(x, y, size, color, imageSrc, false);
}

function addCornerBoxEventListeners(offsetX, offsetY, cols, cellSize, cornerSize) {
    const leftBoxArea = {
        x: offsetX,
        y: offsetY,
        size: cornerSize,
    };

    const rightBoxArea = {
        x: offsetX + (cols - 1) * cellSize + cellSize - cornerSize,
        y: offsetY,
        size: cornerSize,
    };

    let isLeftBoxToggled = false;
    let isRightBoxToggled = false;

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

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
                isLeftBoxToggled ? 'assets/mute.png' : 'assets/volume.png'
            );
        }

        if (
            mouseX >= rightBoxArea.x &&
            mouseX <= rightBoxArea.x + rightBoxArea.size &&
            mouseY >= rightBoxArea.y &&
            mouseY <= rightBoxArea.y + rightBoxArea.size
        ) {
            isRightBoxToggled = !isRightBoxToggled;
            drawRightCornerBox(
                rightBoxArea.x + cornerSize,
                rightBoxArea.y,
                rightBoxArea.size,
                'blue',
                isRightBoxToggled ? 'assets/play-buttton.png' : 'assets/pause.png'
            );
        }
    });
}

// ez az ami megrajzolja őket
function drawCornerBox(x, y, size, color, imageSrc, isRight) {
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

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
        const imageScale = 0.8; 
        const scaledSize = size * imageScale;

   
        const imageX = isRight ? x - scaledSize / 2 - size / 2 : x + size / 2 - scaledSize / 2;
        const imageY = y + size / 2 - scaledSize / 2;

        ctx.drawImage(img, imageX, imageY, scaledSize, scaledSize);
    };
}
//-------------------------------------------------------------//


//--------------------------Logo----------------------------------//
function drawCenterImage(imageSrc, width, height) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 3;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
        ctx.drawImage(img, centerX - width / 2 - 90, centerY - height / 2 - 10, width + 200,  height);
    };
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

    const startButtonImage = new Image();
    startButtonImage.src = 'assets/controller.png'; 
    startButtonImage.onload = () => {
        const imageSize = startButtonSize * 0.8; 
        ctx.drawImage(
            startButtonImage,
            centerX - imageSize / 2,
            centerY - imageSize / 2,
            imageSize,
            imageSize
        );

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

        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(centerX + startButtonSize / 2 + wingOverlap, centerY - wingButtonHeight / 2); // Top-left corner of the 2P button
        ctx.lineTo(centerX + startButtonSize / 2 + wingButtonWidth + wingOverlap, centerY - wingButtonHeight / 2); // Top-right corner
        ctx.lineTo(centerX + startButtonSize / 2 + wingButtonWidth + wingOverlap, centerY + wingButtonHeight / 2); // Bottom-right corner
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
    };
}

//nyilak + end score gomb
function drawEndGameOptions() {
    let selectedNumber = 5; // Initial number

    const x = (canvas.width - buttonWidth) / 2;
    const y = (canvas.height - buttonHeight) / 2 + 160;

    function updateEndGameOptions() {

        drawButton(x, y, buttonWidth, buttonHeight, 'End Score');
        drawButton(x + 25, y + 60, buttonWidth - 50, buttonHeight, selectedNumber.toString());

        const arrowWidth = 40;
        const arrowHeight = 20;
        const spacing = 20;

        drawArrow(x - arrowWidth - spacing + 20, y + buttonHeight / 2 + 60, arrowWidth, arrowHeight, 'left');
        drawArrow(x + buttonWidth + spacing - 20, y + buttonHeight / 2 + 60, arrowWidth, arrowHeight, 'right');
    }

    updateEndGameOptions();

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const arrowWidth = 40;
        const arrowHeight = 20;
        const spacing = 20;

        const leftArrowArea = {
            x: x - arrowWidth - spacing + 20,
            y: y + buttonHeight / 2 + 60 - arrowHeight / 2,
            width: arrowWidth,
            height: arrowHeight,
        };

        const rightArrowArea = {
            x: x + buttonWidth + spacing - 20,
            y: y + buttonHeight / 2 + 60 - arrowHeight / 2,
            width: arrowWidth,
            height: arrowHeight,
        };

        if (
            mouseX >= leftArrowArea.x &&
            mouseX <= leftArrowArea.x + leftArrowArea.width &&
            mouseY >= leftArrowArea.y &&
            mouseY <= leftArrowArea.y + leftArrowArea.height
        ) {
            if (selectedNumber > 1) {
                selectedNumber--;
                updateEndGameOptions();
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
                updateEndGameOptions();
            }
        }
    });
}
//----------------------------------------------------------------------//


run();
