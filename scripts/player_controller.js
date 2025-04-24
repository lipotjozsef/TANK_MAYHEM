
import { PowerUp } from "./powerup.js";
import { mazeGenerator, globalObjects, Vector2, Object, Collider, Ray } from "./core_types.js";
import { normalizeAngle, randomIntMinMax } from "./math_helper_utils.js";
import { Shield, Rocket, Laser } from "./PlayerPowerUps.js"

const canvas = document.querySelector("canvas");
export const ctx = canvas.getContext("2d");



const powerups = []
const POWERUPHELPER = new PowerUp(canvas, 0, 0, 0, 0, 0, 0)

export const activePowerUp = [];

var startTime = Date.now();
export var deltaTime = 0;
var alivePlayersCount = 0;
var isEndOfRound = false;

let playerKeybinds = [
    ["w", "s", "a", "d", " "],
    ["i", "k", "j", "l", "-"],
    ["8", "2", "4", "6", "+"]
]

export const globalPlayers = [];

export class Bullet extends Object {
    constructor(width, height, positionX, positionY, rotation) {
        super(width, height, positionX, positionY, rotation, "bullet.png");
        this.TimeToLiveSecond = 7;
        this.parentPlayer = null;
        this.canKillParent = false;
        this.maxSpeed = 200;
        this.velocity = new Vector2(this.maxSpeed, this.maxSpeed);
        this.collider = new Collider(this, "circle", 2, [1, 3, 6]);
        this.lastPosition = new Vector2(this.position.x, this.position.y);
        this.colliding = false;
        this.rotationMatrix = [1, 0];
        this.deleted = false;
    }

    delete() {
        this.parentPlayer.bulletCount -= 1;
        this.deleted = true;
        super.delete();
    }

    move() {
        globalPlayers.forEach(player => {
            if(this.collider.isColliding(player.collider) && this.canKillParent) {
                player.die();
                this.visible = false;
                this.delete();
            }
        })

        globalObjects.forEach(object => {
            if(object != this){
                if(object == this.parentPlayer && !this.canKillParent) {
                    this.colliding = false; 
                    return;
                }
                else if(object instanceof Bullet) {
                    if(this.collider.isColliding(object.collider)){
                        this.colliding = false;
                    }
                }
                else if(this.collider.isColliding(object)) {
                    // RESET POSITION TO BEFORE COLLISION TO PREVENT JIGGLING
                    this.position.x = this.lastPosition.x;
                    this.position.y = this.lastPosition.y;

                    // ROTATE BULLET AND CALMP ROTATION IN BETWEEN 0 AND 360
                    if(this.rotation == 0) this.rotation = 180;
                    else this.rotation += this.rotation + randomIntMinMax(10, 25);
                    this.rotation = normalizeAngle(this.rotation);

                    this.colliding = true;
                    return;
                }
                else {
                    this.colliding = false;
                }
            } 
        })

        let Alpha = 0;
        if(Math.abs(this.velocity.x) > 0) Math.acos(this.velocity.x / this.velocity.lenght); //Math.acos(x / velocity.lenght)
        let piradRotation = (this.rotation + Alpha) * (Math.PI/180);
        this.rotationMatrix = [
            parseFloat(Math.cos(piradRotation).toFixed(4)),
            parseFloat(Math.sin(piradRotation).toFixed(4))
        ]

        this.velocity.x = this.maxSpeed * this.rotationMatrix[0];
        this.velocity.y = this.maxSpeed * this.rotationMatrix[1];


        if(!this.colliding) {
            this.lastPosition.x = this.position.x;
            this.lastPosition.y = this.position.y;
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
        }
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
        this.collider = new Collider(this, "rectangle", 1, [2, 3, 4, 5]);
        this.isdead = false;
        this.bulletCode = 0;
        globalPlayers.push(this);
        alivePlayersCount += 1;
        this.bulletCount = 0;
        this.playerID = globalPlayers.indexOf(this);
        this.keybinds = playerKeybinds[this.playerID];
        this.spriteImage.src = `./assets/tank${this.playerID}.png`;
    }

    render() {
        super.render(this.scale.width*2, this.scale.height*2)
        ctx.fillStyle = "#000000";
    }

    spawnBullet() {
        if(this.bulletCount == 5) return;
        let bulletPosition = new Vector2(this.position.x+(35*this.rotationMatrix[0]), this.position.y+(35*this.rotationMatrix[1]));
        
        switch(this.bulletCode) {
            case 0:
                let newBullet = new Bullet(8.5, 8.5, bulletPosition.x, bulletPosition.y, this.rotation);
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
        }
        
    }

    usePowerUp(type) {
        switch(type) {
            case "shield":
                let ShieldPowerUp = new Shield(22, 22, this);
                break;
            case "rocket":
                this.bulletCode = 1;
                break;
            case "laser":
                if(this.bulletCode == -1) return;
                this.bulletCode = 2;
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
            let Alpha = 0;
            if(Math.abs(this.velocity.x) > 0) Math.acos(this.velocity.x / this.velocity.lenght); //Math.acos(x / velocity.lenght)
            let piradRotation = (this.rotation + Alpha) * (Math.PI/180);
            this.rotationMatrix = [
                parseFloat(Math.cos(piradRotation).toFixed(4)),
                parseFloat(Math.sin(piradRotation).toFixed(4))
            ]
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
                super.delete();
            }
        })
    }
}

export function start(players) {

    mazeGenerator.resizeCanvasAndMaze()

    for(let i = 0; i < players; i++) {
        let spawnPoint = getrandomSpawnPoint();
        //console.log(spawnPoint, "random spawn point");
        let newPlayer = new Player(spawnPoint[0], spawnPoint[1], 20, 20, 0);
        //console.log(newPlayer.position);
        document.addEventListener("keypress", (event) => {newPlayer.handleInput(event);})
        document.addEventListener("keyup", (event) => {newPlayer.notmoving(event);})
        activePowerUp.push("none");
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
    for(let i = 0; i < mazeGenerator.wallSpaces.length; i++) {
        let wall = mazeGenerator.wallSpaces[i];
        let width = wall[0]*(mazeGenerator.cellSize);
        let height = wall[1]*(mazeGenerator.cellSize);
        let newWallObject = new Object((mazeGenerator.cellSize/1.5), (mazeGenerator.cellSize/1.5), width+mazeGenerator.cellSize/2, height+mazeGenerator.cellSize/2, 0);

        let _ = new Collider(newWallObject, "rectangle", 3, [1, 2, 5]);
    }

    //console.log(activePowerUp);
}

let rightSpawn = false;
function getrandomSpawnPoint() {
    let spawnList = mazeGenerator.leftSpawnSpaces;
    if(rightSpawn) spawnList = mazeGenerator.rightSpawnSpaces;
    let randomIndex = randomIntMinMax(0, spawnList.length);;
    while(spawnList[randomIndex] == undefined) {
        randomIndex = randomIntMinMax(0, spawnList.length);
    }
    rightSpawn = !rightSpawn;
    let xPos = spawnList[randomIndex][0]*mazeGenerator.cellSize;
    let yPos = spawnList[randomIndex][1]*mazeGenerator.cellSize
    return [xPos+(mazeGenerator.cellSize>>1), yPos+(mazeGenerator.cellSize>>1)];
}

function endOfRound() {
    if(isEndOfRound) return;
    isEndOfRound = true;
    console.log("WON")
}

export function mainLoop() {
    
    deltaTime = (Date.now() - startTime) / 1000;
    //console.log(deltaTime);
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
        //setTimeout(endOfRound, 3000)
    }
    requestAnimationFrame(mainLoop);
}

