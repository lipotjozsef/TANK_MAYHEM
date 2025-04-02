import { MazeGenerator } from "./mazegenerator.js";

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const mazeGenerator = new MazeGenerator(5, 5, canvas);
mazeGenerator.initialize();
mazeGenerator.generateMaze(1, 1);
mazeGenerator.drawMaze();


// Collider
const maze = mazeGenerator.maze
const cellSize = mazeGenerator.cellSize
let playerX = 70
let playerY = 70
let playerWidth = 10
ctx.fillStyle = "red"
ctx.rect(playerX, playerY, playerWidth / 2, playerWidth / 2)

console.log(tryMove())

function tryMove() {
    let cellPos = [playerX, playerY]
    for (let i = 0; i  < maze.length; i++) {
        const mazeRow = maze[i];
        for (let j = 0; j < mazeRow.length; j++) {
            if (playerX - j * cellSize < playerWidth / 2) {
                return false
            }
        }
    }
}
