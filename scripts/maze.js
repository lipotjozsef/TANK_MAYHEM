import { MazeGenerator } from "./mazegenerator.js";
import { PowerUp } from "./powerup.js";

const canvas = document.getElementById("myCanvas")
const mazeGenerator = new MazeGenerator(21, 21, canvas);
mazeGenerator.initialize();
mazeGenerator.generateMaze(1, 1);
mazeGenerator.drawMaze();
mazeGenerator.getFreeSpaces();
mazeGenerator.getSpawnSpaces()


const powerups = []
const POWERUPHELPER = new PowerUp(canvas, 0, 0, 0, 0, 0, 0)
for (let i = 0; i < 5; i++) {
    let number = mazeGenerator.freeSpaces[Math.round(Math.random() * mazeGenerator.freeSpaces.length)]
    number > mazeGenerator.freeSpaces.length - 1 ? number = mazeGenerator.freeSpaces.length - 1 : number = number
    const radius = mazeGenerator.cellSize / 4
    const padding = (mazeGenerator.cellSize - radius * 2) / 2
    let typeNumber = Math.round(POWERUPHELPER.typeList.length * Math.random())
    typeNumber > POWERUPHELPER.typeList.length - 1 ? typeNumber = POWERUPHELPER.typeList.length - 1 : typeNumber = typeNumber
    powerups.push(new PowerUp(canvas, number[0], number[1], radius, mazeGenerator.cellSize, padding, typeNumber))    
    powerups[i].spawnPowerUp()
}

//Ez már jó resize
mazeGenerator.resizeCanvasAndMaze(9)


mazeGenerator.drawMaze()