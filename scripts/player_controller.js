import { PowerUp } from "./powerup.js";
import { mazeGenerator, globalObjects, cleanObjects, Vector2, Object, Collider } from "./core_types.js";
import { normalizeAngle, randomIntMinMax, calcRotMatrix, getPositionFromPlayer } from "./math_helper_utils.js";
import { Shield, Rocket, Laser, Explosion } from "./PlayerPowerUps.js"

const canvas = document.querySelector("canvas");
export const ctx = canvas.getContext("2d");

export var scoreToWin = 5; // Default points to reach is 5
let playersStart = -1;

const powerups = []
const POWERUPHELPER = new PowerUp(canvas, 0, 0, 0, 0, 0, 0)

export const activePowerUp = [];
export const playersScore = [];

var startTime = Date.now();
export var deltaTime = 0;
var alivePlayersCount = 0;
var isEndOfRound = false;

let playerKeybinds = [
    ["w", "s", "a", "d", " "],
    ["i", "k", "j", "l", "-"],
    ["8", "5", "4", "6", "+"]
]

export var globalPlayers = [];

export class Bullet extends Object {
    constructor(width, height, positionX, positionY, rotation) {
        super(width, height, positionX, positionY, rotation, "bullet.png");
        this.TimeToLiveSecond = 7;
        this.parentPlayer = null;
        this.canKillParent = false;
        this.maxSpeed = 200;
        this.velocity = new Vector2(this.maxSpeed, this.maxSpeed);
        this.collider = new Collider(this, "circle", 2, [1, 3, 6, 9]);
        this.lastPosition = new Vector2(this.position.x, this.position.y);
        this.colliding = false;
        this.rotationMatrix = [1, 0];
        this.deleted = false;
        this.hits = 0;
    }

    delete() {
        this.parentPlayer.bulletCount -= 1;
        this.deleted = true;
        this.collider.delete();
        super.delete();
    }

    move() {

        if(this.hits >= 50) {
            this.visible = false;
            this.delete();
        }

        globalPlayers.forEach(player => {
            if(this.collider.isColliding(player.collider) && this.canKillParent) {
                player.die();
                this.visible = false;
                this.delete();
            }
        })

        globalObjects.forEach(object => {
            if(object != this){
                if(this.collider.isColliding(object)) {
                    this.colliding = true;
                }
            } 
        })

        this.rotationMatrix = calcRotMatrix(this);

        this.velocity.x = this.maxSpeed * this.rotationMatrix[0];
        this.velocity.y = this.maxSpeed * this.rotationMatrix[1];


        if(!this.colliding) {
            this.lastPosition.x = this.position.x;
            this.lastPosition.y = this.position.y;
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
        } else {
            this.hits += 1;
            // RESET POSITION TO BEFORE COLLISION TO PREVENT JIGGLING
            this.position.x = this.lastPosition.x;
            this.position.y = this.lastPosition.y;

            // ROTATE BULLET AND CALMP ROTATION IN BETWEEN 0 AND 360
            if (this.rotation == 0) this.rotation = 180;
            else this.rotation += this.rotation + randomIntMinMax(1, 5);
            this.rotation = normalizeAngle(this.rotation);
            
        }
        this.colliding = false;
    }

    render() {
        super.render(this.scale.width*2, this.scale.height)
        /*
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.scale.width, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x+this.velocity.x, this.position.y+this.velocity.y);
        ctx.stroke();*/
    }

    spawn(parent) {
        globalObjects.push(this);
        this.canKillParent = false;
        this.parentPlayer = parent;
        setTimeout(() => {
            this.canKillParent = true;
        }, 10);

        setTimeout(() => {
            if(this.deleted) return;
            this.visible = false;
            this.delete();
        }, this.TimeToLiveSecond * 1000);
    }
}

class Player extends Object {
    constructor(spawnX = 0, spawnY = 0, width = 50, height = 50, rotation = 0) {
        super(width, height, spawnX, spawnY, rotation, "");
        this.colliding = false;
        this.lastInput = "";
        this.lastPosition = new Vector2(spawnX, spawnY);
        this.rotationSpeed = 5;
        this.rotaionDirection = 0;
        this.direction = 0;
        this.maxspeed = 150;
        this.drag = 20;
        this.ismoving = false;
        this.rotationMatrix = [0, 1];
        this.collider = new Collider(this, "rectangle", 1, [1, 2, 3, 4, 5, 9]);
        this.isdead = false;
        this.bulletCode = 0;
        globalPlayers.push(this);
        alivePlayersCount += 1;
        this.bulletCount = 0;
        this.playerID = globalPlayers.indexOf(this);
        this.keybinds = playerKeybinds[this.playerID];
        this.spriteImage.src = `./assets/tank${this.playerID}.png`;
        this.canDie = true;
    }

    render() {
        super.render(this.scale.width*2, this.scale.height*2)
        ctx.fillStyle = "#000000";
    }

    spawnBullet() {
        if(this.bulletCount == 5) return;
        let bulletPosition = getPositionFromPlayer(this, this, 35);
        
        switch(this.bulletCode) {
            case 0:
                let newBullet = new Bullet(10, 10, bulletPosition.x, bulletPosition.y, this.rotation);
                newBullet.spawn(this);
                this.bulletCount += 1;
                break;
            case 1:
                let newRocket = new Rocket(bulletPosition.x, bulletPosition.y, this);
                newRocket.spawnBullet();
                break;
            case 2:
                console.log("Laser run")
                let newLaser = new Laser(this);
                newLaser.spawn();
                this.bulletCode = -1;
                break;
            case 3:
                let newExplosive = new Explosion(bulletPosition.x, bulletPosition.y, this);
                newExplosive.spawn();
        }
        
    }

    usePowerUp(type) {
        switch(type) {
            case "shield":
                let ShieldPowerUp = new Shield(25, 25, this);
                this.canDie = false;
                break;
            case "rocket":
                this.bulletCode = 1;
                break;
            case "laser":
                if(this.bulletCode == -1) return;
                this.bulletCode = 2;
                break;
            case "explosion":
                this.bulletCode = 3;
                break;

        }
        console.log(activePowerUp)
    }

    move() {
        if(this.isdead) return;

        globalObjects.forEach(el => {
            if(el != this.collider) {
                if(this.collider.isColliding(el)) {
                    //console.log(this.collider.isColliding(el), el.position.x);
                    //this.direction = 0;
                    this.position.x = this.lastPosition.x;
                    this.position.y = this.lastPosition.y;
                    this.colliding = true;
                    return;
                } else this.colliding = false;
            }
        })

        /*for(let i = 0; i < globalPlayers.length; i++){
            let player = globalPlayers[i];
            if(player.playerID != this.playerID) {
                if(this.collider.isColliding(player.collider)) {
                    this.direction = 0;
                    this.position.x = this.lastPosition.x;
                    this.position.y = this.lastPosition.y;
                    this.colliding = true;
                    return;
                }
            }
            else  this.colliding = false;
        }*/

        if(!this.colliding) {
            this.lastPosition.x = this.position.x;
            this.lastPosition.y = this.position.y;
        }


        this.rotation += this.rotaionDirection * this.rotationSpeed;
        this.rotation = normalizeAngle(this.rotation);

        if(!this.colliding) {
            this.rotationMatrix = calcRotMatrix(this);
        }
        
        

        // DRAG IF NOT PRESSING DOWN ANY BUTTON
        if(!this.ismoving) {
            if(Math.abs(this.velocity.x) > this.drag) this.velocity.x += -1 * (this.velocity.x / Math.abs(this.velocity.x)) * (this.drag);
            else this.velocity.x = 0;
            if(Math.abs(this.velocity.y) > this.drag) this.velocity.y += -1 * (this.velocity.y / Math.abs(this.velocity.y)) * (this.drag);
            else this.velocity.y = 0;
        }
        else {
            this.velocity.x = this.maxspeed * this.rotationMatrix[0] * this.direction;
            this.velocity.y = this.maxspeed * this.rotationMatrix[1] * this.direction;
        }

        this.position.y += this.velocity.y * deltaTime;
        this.position.x += this.velocity.x * deltaTime;
    }

    handleInput(event) {
        //console.log(event.key);
        let key = event.key.toLowerCase();
        if(!this.keybinds.includes(event.key) || event.repeat || this.lastInput == key || this.isdead) return;
        //console.log(key);
        event.preventDefault();

        // SPAWN BULLET
        if(key == this.keybinds[4]) this.spawnBullet();

        // VELOCITY 
        if(key == this.keybinds[0]) this.direction = 1;
        if(key == this.keybinds[1]) this.direction = -1;

        // ROTATION
        if(key == this.keybinds[2]) this.rotaionDirection = -1;
        if(key == this.keybinds[3]) this.rotaionDirection = 1;

        // DRAG
        if(this.direction != 0) this.ismoving = true;
        this.lastInput = key;
    }

    notmoving(event) {
        if(!this.keybinds.includes(event.key) || event.repeat || this.isdead) return;
        event.preventDefault();
        let key = event.key.toLowerCase();
        if(key == this.keybinds[2] && this.rotaionDirection == -1 || key == this.keybinds[3] && this.rotaionDirection == 1) this.rotaionDirection = 0;
        if(key == this.keybinds[0] && this.direction == 1 || key == this.keybinds[1] && this.direction == -1) {
            this.direction = 0;
            this.ismoving = false;
        }
        this.lastInput = "";
    }

    die() {
        if(!this.canDie) return;
        this.isdead = true;
        alivePlayersCount -= 1;
        globalObjects.splice(globalObjects.indexOf(this.collider), 1);
        globalPlayers.splice(globalPlayers.indexOf(this), 1);
    }
}

class PowerUpCollision extends Collider {
    constructor(parent, type, powerUp) {
        super(parent, type);
        this.collider = new Collider(this, "circle", 4, [1]);
        this.colliding = false;
        this.powerup = powerUp;
    }

    isColliding(collider) {
        if(!(collider instanceof Player) ) return false;
        else return super.isColliding(collider);
    }

    render() {
        super.render();
    }

    move() {
        globalPlayers.forEach(player => {
            if(this.collider.isColliding(player.collider)) {
                if(activePowerUp[player.playerID] != "none") return;
                let type = this.powerup.disspawnPowerUp();
                activePowerUp[player.playerID] = this.powerup.type;
                player.usePowerUp(type);
                this.collider.delete();
                super.delete();
            }
        })
    }
}

export function start(players) {

    if (playersStart == -1) playersStart = players;

    mazeGenerator.resizeCanvasAndMaze()

    for(let i = 0; i < players; i++) {
        let spawnPoint = getrandomSpawnPoint();
        //console.log(spawnPoint, "random spawn point");
        let newPlayer = new Player(spawnPoint[0], spawnPoint[1], 20, 20, 0);
        //console.log(newPlayer.position);
        document.addEventListener("keypress", (event) => {newPlayer.handleInput(event);})
        document.addEventListener("keyup", (event) => {newPlayer.notmoving(event);})
        
        if(playersScore.length != players && activePowerUp.length != players) {
            playersScore.push(0);
            activePowerUp.push("none");
        }
    }
    
    const radius = 20;
    const padding = (mazeGenerator.cellSize - radius * 2) / 2;
    for (let i = 0; i < 5; i++) {
        let number = mazeGenerator.freeSpaces[Math.round(1+Math.random() * mazeGenerator.freeSpaces.length)];
        while(number == undefined) {
            number = mazeGenerator.freeSpaces[Math.round(1+Math.random() * mazeGenerator.freeSpaces.length)];
        }
        let typeNumber = Math.round(POWERUPHELPER.typeList.length * Math.random())
        typeNumber > POWERUPHELPER.typeList.length - 1 ? typeNumber = POWERUPHELPER.typeList.length - 1 : typeNumber = typeNumber
        let newPOWERUP = new PowerUp(canvas, number[0], number[1], radius, mazeGenerator.cellSize, padding, typeNumber);
        powerups.push(newPOWERUP);
        let newPowerUpObject = new Object(radius, radius, number[0]*(mazeGenerator.cellSize) + (mazeGenerator.cellSize/2), number[1]*mazeGenerator.cellSize+ (mazeGenerator.cellSize/2), 0);
        let _ = new PowerUpCollision(newPowerUpObject, "circle", newPOWERUP);
    }

    //for(let i = 0; i < mazeGenerator.wallSpaces.length; i++) {
    let lastwallpos = [];
    for(let i = 0; i < mazeGenerator.wallSpaces.length; i++) {
        let wall = mazeGenerator.wallSpaces[i];
        let width = wall[0]*(mazeGenerator.cellSize);
        let height = wall[1]*(mazeGenerator.cellSize);
        let size = mazeGenerator.cellSize * 0.75;
        let newWallObject = new Object(size, size, width+mazeGenerator.cellSize/2, height+mazeGenerator.cellSize/2, 0);

        let _ = new Collider(newWallObject, "rectangle", 3, [1, 2, 5, 9]);
        lastwallpos = wall;
    }
    isEndOfRound = false;
    //console.log(activePowerUp);
}

export function setScoreToWin(newNum) {
    scoreToWin = newNum;
}

let rightSpawn = false;
let alreadyTakenSpaces = [];
function getrandomSpawnPoint() {
    let spawnList = mazeGenerator.leftSpawnSpaces;
    if(rightSpawn) spawnList = mazeGenerator.rightSpawnSpaces;
    let randomIndex = randomIntMinMax(0, spawnList.length);;
    while(spawnList[randomIndex] == undefined || alreadyTakenSpaces.includes(randomIndex)) {
        randomIndex = randomIntMinMax(0, spawnList.length);
    }
    alreadyTakenSpaces.push(randomIndex);
    rightSpawn = !rightSpawn;
    let xPos = spawnList[randomIndex][0]*mazeGenerator.cellSize;
    let yPos = spawnList[randomIndex][1]*mazeGenerator.cellSize;
    return [xPos+(mazeGenerator.cellSize>>1), yPos+(mazeGenerator.cellSize>>1)];
}

export let winner = null;

let winnerTextTimeout = null;

function displayWinnerText(playerID) {
    const colors = ["red", "green", "blue"];
    const winnerText = document.createElement("div");
    winnerText.id = "winner-text";
    winnerText.style.position = "absolute";
    winnerText.style.top = "50%";
    winnerText.style.left = "50%";
    winnerText.style.transform = "translate(-50%, -50%)";
    winnerText.style.fontSize = "80px";
    winnerText.style.fontWeight = "bold";
    winnerText.style.color = colors[playerID];
    winnerText.style.textAlign = "center";
    winnerText.style.zIndex = "1000";
    winnerText.textContent = `Player ${playerID + 1} Wins!`;

    document.body.appendChild(winnerText);

    if (winnerTextTimeout) clearTimeout(winnerTextTimeout);
    winnerTextTimeout = setTimeout(() => {
        document.body.removeChild(winnerText);
    }, 3000);
}

function displayFinalWinnerText(playerID) {
    const colors = ["red", "green", "blue"];
    const finalWinnerText = document.createElement("div");
    finalWinnerText.id = "final-winner-text";
    finalWinnerText.style.position = "absolute";
    finalWinnerText.style.top = "50%";
    finalWinnerText.style.left = "50%";
    finalWinnerText.style.transform = "translate(-50%, -50%)";
    finalWinnerText.style.fontSize = "100px";
    finalWinnerText.style.fontWeight = "bold";
    finalWinnerText.style.color = colors[playerID];
    finalWinnerText.style.textAlign = "center";
    finalWinnerText.style.zIndex = "1000";
    finalWinnerText.textContent = `Player ${playerID + 1} Wins the Game!`;

    document.body.appendChild(finalWinnerText);

    setTimeout(() => {
        document.body.removeChild(finalWinnerText);
        location.reload(); 
    }, 5000);
}

function endOfRound() {
    globalPlayers.forEach(player => {
        if (!player.isdead) {
            winner = player;
        }
    });

    if (winner == null) {
        console.log("Nobody won this round!");
    } else {
        playersScore[winner.playerID] += 1;
        let winnerScore = playersScore[winner.playerID];
        console.log(`Player ${winner.playerID + 1} won this round! Current score: ${winnerScore} pts`);

        if (winnerScore >= scoreToWin) {
            console.log(`${winner.playerID + 1} won the whole match!\nReturning to the main page.`);
            displayFinalWinnerText(winner.playerID); 
            return; 
        }

        displayWinnerText(winner.playerID); 
    }
    newRound();
}


if (scoreToWin === 2) {
    scoreToWin = 5;
}

function newRound() {
    winner = null;
    cleanObjects();
    alreadyTakenSpaces = [];
    globalPlayers.length = 0;
    console.log(globalPlayers.length);
    powerups.forEach(pw => pw.disspawnPowerUp())
    powerups.length = 0;
    alivePlayersCount = 0;
    start(playersStart);
}

export function mainLoop() {
    
    deltaTime = (Date.now() - startTime) / 1000;

    startTime = Date.now();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    mazeGenerator.drawMaze();

    powerups.forEach(el => {
        el.spawnPowerUp()
    })

    globalPlayers.forEach(el => {
        el.render();
        el.move();
    })

    globalObjects.forEach(el => {
        el.render();
        el.move();
    })

    if(alivePlayersCount == 1 && isEndOfRound == false) {
        console.log("END OF ROUND");
        isEndOfRound = true;
        setTimeout(endOfRound, 7000);
    }
    requestAnimationFrame(mainLoop);
}

