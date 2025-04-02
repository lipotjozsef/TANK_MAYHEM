import { MazeGenerator } from "./mazegenerator.js";

const canvas = document.getElementById("canvas")

const mazeGenerator = new MazeGenerator(21, 21, canvas);
mazeGenerator.initialize();
mazeGenerator.generateMaze(1, 1);
mazeGenerator.drawMaze();