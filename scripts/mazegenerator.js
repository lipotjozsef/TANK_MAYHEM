export class MazeGenerator {
    constructor(width, height, canvas) {
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 50;
        this.wallWidth = this.cellSize / 2
        this.faceing = 0
        this.maze = [];
        this.visited = [];
        this.stack = [];
        this.freeSpaces = []
        this.wallSpaces = []
        this.leftSpawnSpaces = []
        this.rightSpawnSpaces = []
        this.wallEmptySpace = this.cellSize - this.wallWidth;
    }

    resizeCanvasAndMaze(width = this.width, height = this.height, cellSize = this.cellSize)
    {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.canvas.width = this.width * this.cellSize;
        this.canvas.height = this.height * this.cellSize;
        this.initialize()
        this.generateMaze(1,1)
        this.getFreeSpaces()
        this.getSpawnSpaces()
    }

    getFreeSpaces(){
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.maze[y][x] === 0) {
                    this.freeSpaces.push([x, y])
                }
                else{
                    this.wallSpaces.push([x, y])
                }
            }
        }
    }

    getSpawnSpaces()
    {
        for (let y = 0; y < this.height; y++) {
            for (let x = 1; x < (this.width / 2) - 1.5 ; x++) {
                if (this.maze[y][x] === 0) {
                    this.leftSpawnSpaces.push([x, y])
                    this.ctx.fillStyle = "red"
                    // this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize - 10, this.cellSize - 10)
                }
            }
        } 

        for (let y = 0; y < this.height; y++) {
            for (let x = (this.width / 2) + 1.5; x < this.width; x++) {
                if (this.maze[y][x] === 0) {
                    this.rightSpawnSpaces.push([x, y])
                    this.ctx.fillStyle = "green"
                    // this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize - 10, this.cellSize - 10)
                }
            }
        }
    }

    // Initialize the maze and visited arrays
    initialize() {
        for (let y = 0; y < this.height; y++) {
            this.maze[y] = [];
            this.visited[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.maze[y][x] = 1; // 1 = wall
                this.visited[y][x] = false;
            }
        }
    }

    // Directions for DFS (up, right, down, left)
    getDirections() {
        return [
            [-2, 0], // up
            [0, 2],  // right
            [2, 0],  // down
            [0, -2], // left
        ];
    }

    // Shuffle the directions for random movement
    shuffleDirections() {
        const directions = this.getDirections();
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        return directions;
    }

    // Check if a position is inside the maze bounds
    isInBounds(x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }

    isHorizontalEdgeCell(x)
    {
        return x == 0 || x == this.width - 1
    }
    isVerticalEdgeCell(y)
    {
        return y == 0 || y == this.width - 1
    }

    // Draw a single cell (wall or path)
    drawCell(x, y, type) {
        const color = type === 1 ? 'black' : 'white'; // wall or path
        this.ctx.fillStyle = color;

        if (color === "white") {
            this.ctx.fillRect(x * this.cellSize - this.wallEmptySpace / 2, y * this.cellSize - this.wallEmptySpace / 2, this.cellSize + this.wallEmptySpace, this.cellSize + this.wallEmptySpace);  
        }
        if(color === "black")
        {
            this.ctx.fillRect(x * this.cellSize + this.wallEmptySpace / 2, y * this.cellSize + this.wallEmptySpace /2 , this.cellSize, this.cellSize); 
        }
        
    }

    // Carve a path (remove wall between current and new position)
    carvePath(x, y, nx, ny) {
        this.maze[ny][nx] = 0; // Mark new cell as a path
        this.maze[y + (ny - y) / 2][x + (nx - x) / 2] = 0; // Remove the wall between the cells
    }

    // Generate the maze using DFS
    generateMaze(startX = 1, startY = 1) {
        this.stack.push([startX, startY]);
        this.visited[startY][startX] = true;
        this.maze[startY][startX] = 0; // Set the start point as a path
        this.drawCell(startX, startY, 0); // Draw the start point

        while (this.stack.length > 0) {
            const [x, y] = this.stack[this.stack.length - 1];
            const directions = this.shuffleDirections();
            let moved = false;

            for (let [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;

                if (this.isInBounds(nx, ny) && !this.visited[ny][nx]) {
                    this.visited[ny][nx] = true;
                    this.carvePath(x, y, nx, ny);
                    this.stack.push([nx, ny]);
                    this.drawCell(nx, ny, 0); // Draw new path cell               
                    moved = true;
                    break;
                }
            }

            if (!moved) {
                this.stack.pop(); // Backtrack
            }
        }
    }

    // Draw the entire maze on the canvas
    drawMaze() {
        this.ctx.fillStyle = "black"
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height)
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.drawCell(x, y, this.maze[y][x]);
            }
        }
        this.ctx.fillStyle = "white"
        this.ctx.fillRect(0,0, this.canvas.width, this.cellSize - this.wallWidth)
        this.ctx.fillRect(this.canvas.width - this.cellSize + this.wallWidth, this.cellSize - this.wallWidth - 10, this.cellSize, this.canvas.height)

        this.ctx.fillRect(0, 0, this.cellSize - this.wallWidth, this.canvas.height)
        this.ctx.fillRect(0, this.canvas.height - this.cellSize + this.wallWidth, this.canvas.width, this.cellSize)
    }
}

// Create a maze with a specific width and height (in terms of cells)
// const canvas = document.getElementById('mazeCanvas');
// const mazeGenerator = new MazeGenerator(21, 21, canvas);

// Initialize the maze and generate it
// mazeGenerator.initialize();
// mazeGenerator.generateMaze(10, 1); // Start at (1, 1)
// mazeGenerator.drawMaze();