const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

var startTime = Date.now();
var deltaTime = 0;
var playerCount = 0;

let playerKeybinds = [
    ["w", "s", "a", "d", " "],
    ["i", "k", "j", "l", "Enter"]
]

const globalPlayers = [];

const globalObjects = [];
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = x;
        this.height = y;
    }
}

class Vector2 extends Point {
    constructor(x, y) {
        super(x,y);
    }

    get lenght() {
        return Math.sqrt(this.x**2+this.y**2);
    }

    add(adderVec) {
        this.x += adderVec.x;
        this.y += adderVec.y;
    }

    sub(subVec) {
        this.x -= subVec.x;
        this.y -= adderVec.y;
    }

    normalize() {
        this.x /= this.lenght;
        this.y /= this.lenght;
    }

    toString() {
        return `x:${this.x}, y:${this.y}`;
    }
}

class Object {
    constructor(width = 50, height = 50, startX = 0, startY = 0, rotation = 0) {
        this.scale = new Point(width, height);
        this.position = new Point(startX, startY)
        this.velocity = new Vector2(0, 0);
        this.rotation = rotation;
    }

    render() {
    }
}

class Collider extends Object {
    constructor(parent, type) {
        super();
        this.type = type;
        this.parent = parent;
        this.iscolliding = false;
        globalObjects.push(this);
    }


    isColliding(collider) {
        if(this.type == "rectangle" && collider.type == "rectangle") {
            if(
                this.parent.position.x + (this.parent.scale.width) >= collider.parent.position.x &&
                this.parent.position.x <= collider.parent.position.x + (collider.parent.scale.width) &&
                this.parent.position.y + (this.parent.scale.height) >= collider.parent.position.y &&
                this.parent.position.y <= collider.parent.position.y + (collider.parent.scale.height)
            ) {
                this.iscolliding = true;
                return true;
            }
            else {
                this.iscolliding = false;
                return false;
            }
        }
        else if(this.type == "circle" && collider.type == "rectangle") {
            let closestPoint = new Vector2(
                clamp(collider.parent.position.x,collider.parent.position.x + collider.parent.scale.width,this.parent.position.x),
                clamp(collider.parent.position.y,collider.parent.position.y + collider.parent.scale.height,this.parent.position.y)
            );

            let distance = parseFloat(Math.sqrt((closestPoint.x - this.parent.position.x)**2 + (closestPoint.y - this.parent.position.y)**2).toFixed(4));

            if(distance <= this.scale.width) return true;
            else return false;
        }
        
    }

    move() {

    }

    render() {
        this.position = this.parent.position;
        this.rotation = this.parent.rotation;
        this.scale = this.parent.scale;

        if(this.type == "rectangle") {
            ctx.save();
            ctx.translate(this.position.x, this.position.y); // Position the rect to the center
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.beginPath();
            if (!this.iscolliding) ctx.strokeStyle = "#00FF00";
            else ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 3;
            ctx.rect(-this.scale.width/2, -this.scale.height/2, this.scale.width, this.scale.height);
            ctx.stroke();
            ctx.restore();
        }
        if(this.type == "circle") {
            ctx.save();
            ctx.beginPath();
            if (!this.iscolliding) ctx.strokeStyle = "#00FF00";
            else ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 3;
            ctx.arc(this.position.x, this.position.y, this.scale.width, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        
    }
}

class Bullet extends Object {
    constructor(width, height, positionX, positionY, rotation) {
        super(width, height, positionX, positionY, rotation);
        this.collider = new Collider(this, "circle");
    }

    move() {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
    }

    render() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.scale.width, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x+this.velocity.x, this.position.y+this.velocity.y);
        ctx.stroke();
    }

    spawn(direction) {
        this.velocity = direction;
        console.log(direction);
        globalObjects.push(this);
    }
}

class Player extends Object {
    constructor(spawnX = 0, spawnY = 0, width = 50, height = 50, rotation = 0) {
        super(width, height, spawnX, spawnY, rotation);
        this.colliding = false;
        this.lastPosition = new Vector2(0, 0);
        this.rotation = 0;
        this.rotationSpeed = 5;
        this.rotaionDirection = 0;
        this.direction = 0;
        this.maxspeed = 250;
        this.drag = 20;
        this.ismoving = false;
        this.rotationMatrix = [1, 0];
        this.collider = new Collider(this, "rectangle");
        this.isdead = false;
        globalPlayers.push(this);
        this.playerID = globalPlayers.indexOf(this);
        this.keybinds = playerKeybinds[this.playerID];
    }

    render() {
        ctx.fillStyle = "#000000";

        // DRAW TANK
        ctx.save();
        ctx.translate(this.position.x, this.position.y); // Position the rect to the center
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.beginPath();
        ctx.rect(-this.scale.width/2, -this.scale.height/2, this.scale.width, this.scale.height);
        ctx.fill();
        ctx.restore();

        // VELOCITY DEBUG DRAW
        ctx.strokeStyle = "#0000FF";
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x+this.velocity.x, this.position.y+ this.velocity.y);
        ctx.stroke();

        // FOWARDS VECTOR DEBUG DRAW
        ctx.strokeStyle = "#0000FF";
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x+(100*this.rotationMatrix[0]), this.position.y+(100*this.rotationMatrix[1]));
        ctx.stroke();
        
        // POSITION DEBUG DRAW
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 10, 0, 2*Math.PI);
        ctx.fill();
        
    }

    spawnBullet() {
        let newBullet = new Bullet(20, 20, this.position.x+(100*this.rotationMatrix[0]), this.position.y+(100*this.rotationMatrix[1]), 0);
        newBullet.rotation = this.rotation;
        newBullet.spawn(new Vector2(250 * this.rotationMatrix[0], 250 * this.rotationMatrix[1]));
    }

    move() {
        if(!this.colliding) {
            this.lastPosition.x = this.position.x;
            this.lastPosition.y = this.position.y;
        }

        globalPlayers.forEach(player => {
            if(player != this && this.collider.isColliding(player.collider)) {
                this.position.x = this.lastPosition.x;
                this.position.y = this.lastPosition.y;
                this.colliding = true;
                return;
            }
            else this.colliding = false;
        })

        this.rotation += this.rotaionDirection * this.rotationSpeed;

        let Alpha = 0;
        if(Math.abs(this.velocity.x) > 0) Math.acos(this.velocity.x / this.velocity.lenght); //Math.acos(x / velocity.lenght)
        let piradRotation = (this.rotation + Alpha) * (Math.PI/180);
        this.rotationMatrix = [
            parseFloat(Math.cos(piradRotation).toFixed(4)),
            parseFloat(Math.sin(piradRotation).toFixed(4))
        ]

        this.velocity.x = this.maxspeed * this.rotationMatrix[0] * this.direction;
        this.velocity.y = this.maxspeed * this.rotationMatrix[1] * this.direction;

        this.position.y += this.velocity.y * deltaTime;
        this.position.x += this.velocity.x * deltaTime;
        

        // DRAG IF NOT PRESSING DOWN ANY BUTTON
        if(!this.ismoving) {
            if(Math.abs(this.velocity.x) > this.drag) this.velocity.x += -1 * this.direction * (this.drag);
            else this.velocity.x = 0;
            if(Math.abs(this.velocity.y) > this.drag) this.velocity.y += -1 * this.direction * (this.drag);
            else this.velocity.y = 0;
        }

    }

    handleInput(event) {
        let key = event.key.toLowerCase();
        console.log(key);
        if(!this.keybinds.includes(event.key) || event.repeat) return;
        
        

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
    }

    notmoving(event) {
        if(!this.keybinds.includes(event.key) || event.repeat) return;
        let key = event.key.toLowerCase();
        if(key == this.keybinds[2] && this.rotaionDirection == -1 || key == this.keybinds[3] && this.rotaionDirection == 1) this.rotaionDirection = 0;
        if(key == this.keybinds[0] && this.direction == 1 || key == this.keybinds[1] && this.direction == -1) {
            this.direction = 0;
            this.ismoving = false;
        }
    }

    die() {
        this.isdead = true;
    }
}

function clamp(min, max, value) {
    return Math.max(min, Math.min(max, value));
}

function start(players) {
    playerCount = players;

    for(let i = 0; i < players; i++) {
        let newPlayer = new Player((canvas.width >> 1)+(Math.random() * 200), (canvas.height >> 1)+(Math.random() * 200));
        console.log(newPlayer.position);
        document.addEventListener("keypress", (event) => {newPlayer.handleInput(event);})
        document.addEventListener("keyup", (event) => {newPlayer.notmoving(event);})
    }
}

function mainLoop() {
    deltaTime = (Date.now() - startTime) / 1000;
    //console.log(deltaTime);
    startTime = Date.now();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    globalPlayers.forEach(el => {
        el.render();
        el.move();
    })

    globalObjects.forEach(el => {
        
        el.render();
        el.move();
    })
    

    requestAnimationFrame(mainLoop);
}

start(2);
mainLoop();