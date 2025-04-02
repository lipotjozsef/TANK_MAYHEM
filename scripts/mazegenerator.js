export class MazeGenerator {
    constructor(width, height, canvas) {
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 50;
        this.canvas.width = this.width * this.cellSize;
        this.canvas.height = this.height * this.cellSize;
        this.maze = [];
        this.visited = [];
        this.stack = [];
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

    // Draw a single cell (wall or path)
    drawCell(x, y, type) {
        const color = type === 1 ? 'black' : 'white'; // wall or path
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
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
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.drawCell(x, y, this.maze[y][x]);
            }
        }
    }
}

// Create a maze with a specific width and height (in terms of cells)
// const canvas = document.getElementById('mazeCanvas');
// const mazeGenerator = new MazeGenerator(21, 21, canvas);

// Initialize the maze and generate it
// mazeGenerator.initialize();
// mazeGenerator.generateMaze(10, 1); // Start at (1, 1)
// mazeGenerator.drawMaze();