const canvas = document.getElementById('game_canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1080;
canvas.height = 720;

function drawGrid(cellSize) {
    const rows = Math.floor(canvas.height / cellSize);
    const cols = Math.floor(canvas.width / cellSize);

    const offsetX = (canvas.width - cols * cellSize) / 2;
    const offsetY = (canvas.height - rows * cellSize) / 2;

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    for (let i = 0; i <= rows; i++) {
        const y = offsetY + i * cellSize;
        ctx.beginPath();
        ctx.moveTo(offsetX, y);
        ctx.lineTo(offsetX + cols * cellSize, y);
        ctx.stroke();
    }

    for (let j = 0; j <= cols; j++) {
        const x = offsetX + j * cellSize;
        ctx.beginPath();
        ctx.moveTo(x, offsetY);
        ctx.lineTo(x, offsetY + rows * cellSize);
        ctx.stroke();

        const cornerSize = cellSize * 1.4; 
        const radius = 50; 

        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        ctx.lineTo(offsetX + cornerSize, offsetY);
        ctx.lineTo(offsetX + cornerSize, offsetY + radius);
        ctx.lineTo(offsetX + cornerSize, offsetY + cornerSize - radius);
        ctx.quadraticCurveTo(offsetX + cornerSize, offsetY + cornerSize, offsetX + cornerSize - radius, offsetY + cornerSize);
        ctx.lineTo(offsetX + radius, offsetY + cornerSize);
        ctx.lineTo(offsetX, offsetY + cornerSize);
        ctx.lineTo(offsetX, offsetY);
        ctx.closePath();
        ctx.fill();

        const img = new Image();
        img.src = 'assets/tank-favicon.png';
        img.onload = () => {
            ctx.drawImage(img, offsetX, offsetY, cornerSize, cornerSize);
        };

        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(offsetX + (cols - 1) * cellSize + cellSize, offsetY);
        ctx.lineTo(offsetX + (cols - 1) * cellSize + cellSize - cornerSize, offsetY);
        ctx.lineTo(offsetX + (cols - 1) * cellSize + cellSize - cornerSize, offsetY + radius);
        ctx.lineTo(offsetX + (cols - 1) * cellSize + cellSize - cornerSize, offsetY + cornerSize - radius);
        ctx.quadraticCurveTo(offsetX + (cols - 1) * cellSize + cellSize - cornerSize, offsetY + cornerSize, offsetX + (cols - 1) * cellSize + cellSize - cornerSize + radius, offsetY + cornerSize);
        ctx.lineTo(offsetX + (cols - 1) * cellSize + cellSize - radius, offsetY + cornerSize);
        ctx.lineTo(offsetX + (cols - 1) * cellSize + cellSize, offsetY + cornerSize);
        ctx.lineTo(offsetX + (cols - 1) * cellSize + cellSize, offsetY);
        ctx.closePath();
        ctx.fill();

        const imgBlue = new Image();
        imgBlue.src = 'assets/tank-favicon.png';
        imgBlue.onload = () => {
            ctx.drawImage(imgBlue, offsetX + (cols - 1) * cellSize + cellSize - cornerSize, offsetY, cornerSize, cornerSize);
        };

    }
}

drawGrid(72);

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const imageSize = 500;

const centerImage = new Image();
centerImage.src = 'assets/tankmayhem_logo.png';
centerImage.onload = () => {
    ctx.drawImage(centerImage, centerX - imageSize / 2, centerY - imageSize / 2, imageSize, imageSize);
};