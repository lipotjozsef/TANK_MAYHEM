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
    const number = mazeGenerator.freeSpaces[Math.round(Math.random() * mazeGenerator.freeSpaces.length)]
    const radius = 20
    const padding = (mazeGenerator.cellSize - radius * 2) / 2
    let typeNumber = Math.round(POWERUPHELPER.typeList.length * Math.random())
    typeNumber > POWERUPHELPER.typeList.length - 1 ? typeNumber = POWERUPHELPER.typeList.length - 1 : typeNumber = typeNumber
    console.log(typeNumber)
    powerups.push(new PowerUp(canvas, number[0], number[1], radius, mazeGenerator.cellSize, padding, typeNumber))    
    powerups[i].spawnPowerUp()
}

console.log(powerups)

// const i = 0
// powerups[i].disspawnPowerUp()
// powerups.splice(i, 1)
