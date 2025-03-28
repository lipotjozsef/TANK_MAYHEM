import { MazeGrid } from "./mazegrid.js";

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const width = 20;
const height = 20;
let CoursorPosY = 0
let CoursorPosX = 0
let maze = []

for (let index = 0; index < height * width; index++) {
    let top, right, bottom, left  
    if (Math.random() == 1) { top = "open"}
    else top = "closed"
    if (Math.random() == 1) { right = "open"}
    else right = "closed"
    if (Math.random() == 1) { bottom = "open"}
    else bottom = "closed"
    if (Math.random() == 1) { left = "open"}
    else left = "closed"
    maze.push(new MazeGrid(top, right, bottom, left, canvas.width / width, canvas.height / height))
}

for (let index = 1; index < maze.length + 1; index++) {
    const element = maze[index - 1];
    ctx.strokeRect(CoursorPosX, CoursorPosY, element.width, element.height)
    CoursorPosX += element.width
    if (index % width == 0) {
        CoursorPosY += element.height
        CoursorPosX = 0
    }
    let X = 0
    let Y = 0
    if (element.top == "open") {
        
    }
}