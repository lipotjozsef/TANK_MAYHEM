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
    drawCenterImage(logoSrc, imageSize);
    drawSideButtons(buttonText);
    drawEndGameOptions();
}
//------------------


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

    drawLeftCornerBox(offsetX, offsetY, cornerSize, 'red', 'assets/sound.png');
    drawRightCornerBox(offsetX + (cols - 1) * cellSize + cellSize, offsetY, cornerSize, 'blue', 'assets/pause.png');
}
function drawRightCornerBox(x, y, size, color, imageSrc) {
    drawCornerBox(x, y, size, color, imageSrc, true);
}
function drawLeftCornerBox(x, y, size, color, imageSrc) {
    drawCornerBox(x, y, size, color, imageSrc, false);
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
        ctx.drawImage(img, isRight ? x - size : x, y, size, size);
    };
}
//-------------------------------------------------------------//


//--------------------------Logo----------------------------------//
function drawCenterImage(imageSrc, size) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 3;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
        ctx.drawImage(img, centerX - size / 2, centerY - size / 2, size, size);
    };
}
//------------------------------------------------------------//


//-------------------------Also gombok----------------------------// 
//alap drawing function
function drawButton(x, y, width, height, text) {
    ctx.fillStyle = 'black';
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);
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

//1,2. + start gomb
function drawSideButtons(text) {
    const x = (canvas.width - buttonWidth) / 2;
    const y = (canvas.height - buttonHeight) / 2 + 80;

    drawButton(x, y, buttonWidth, buttonHeight, text);

    const smallButtonWidth = 80;
    const smallButtonHeight = 40;
    const spacing = 20;

    const onePlayerX = x - smallButtonWidth - spacing;
    const twoPlayerX = x + buttonWidth + spacing;

    drawButton(onePlayerX, y, smallButtonWidth, smallButtonHeight, '1P');
    drawButton(twoPlayerX, y, smallButtonWidth, smallButtonHeight, '2P');
}

//nyilak + end score gomb
function drawEndGameOptions() {
    const x = (canvas.width - buttonWidth) / 2;
    const y = (canvas.height - buttonHeight) / 2 + 160;

    drawButton(x, y, buttonWidth, buttonHeight, 'End Score');
    drawButton(x + 25, y + 60, buttonWidth -50, buttonHeight, '5');
    const arrowWidth = 40;
    const arrowHeight = 20;
    const spacing = 20;

    drawArrow(x - arrowWidth - spacing + 20, y + buttonHeight / 2 + 60, arrowWidth, arrowHeight, 'left');
    drawArrow(x + buttonWidth + spacing - 20, y + buttonHeight / 2 + 60, arrowWidth, arrowHeight, 'right');
}
//----------------------------------------------------------------------//


run();
