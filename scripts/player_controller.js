const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

var startTime = Date.now();
var deltaTime = 0;
var playerCount = 0;

const globalPlayers = [];

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

    get angle() {
        // a x b = |a| * |b| * cosBeta
        // a = this vector2
        // b = x axis vector2
        // x (1, 0)
        // cos-1(a1*b1 + a2*b2 / |a| * |b|)
        if(this.x == 0) return 0;
        else return parseFloat(Math.tan(this.y / this.x).toFixed(4));
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
    constructor() {
        super();
    }

    isColliding(collider) {
        return true;
    }

    debugDraw() {

    }
}

class Player extends Object {
    constructor(spawnX = 0, spawnY = 0, width = 50, height = 50, rotation = 0) {
        super(width, height, spawnX, spawnY, rotation);
        this.rotation = 0;
        this.maxspeed = 250;
        this.ismoving = false;
        this.collider = new Collider();
        this.isdead = false;
        globalPlayers.push(this);
    }

    render() {
        ctx.fillStyle = "#000000";
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.beginPath();
        //ctx.rect(this.position.x - (this.scale.width >> 1), this.position.y - (this.scale.height >> 1), this.scale.width, this.scale.height);
        ctx.rect(-this.scale.width/2, -this.scale.height/2, this.scale.width, this.scale.height);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = "#0000FF";
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x+this.velocity.x, this.position.y+ this.velocity.y);
        ctx.stroke();
        
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 10, 0, 2*Math.PI);
        ctx.fill();

        
        
    }

    spawn() {

    }

    move() {
        let piradRotation = this.rotation * (Math.PI/180)
        this.velocity.x = this.velocity.x * Math.cos(piradRotation);
        this.velocity.y = this.velocity.y * Math.sin(piradRotation);
        console.log("-----------")
        console.log(this.velocity.toString());
        console.log(this.rotation);
        
        this.position.y += this.velocity.y * deltaTime;
        this.position.x += this.velocity.x * deltaTime;

        if(Math.abs(this.velocity.x) > 0 && !this.ismoving) {
            this.velocity.x += -1 * (this.velocity.x / Math.abs(this.velocity.x)) * 20;
            this.velocity.y += -1 * (this.velocity.y / Math.abs(this.velocity.y)) * 20
        }
    }

    handleInput(event) {
        let key = event.key;
        switch(key){
            case "w":
                this.velocity.x = this.maxspeed;
                this.velocity.y = this.maxspeed;
                this.ismoving = true;
                break;
            case "s":
                this.velocity.x = -this.maxspeed;
                this.velocity.y = -this.maxspeed;
                this.ismoving = true;
                break;
            case "a":
                this.rotation += 15;
                break;
            case "d":
                this.rotation -= 15;
                break;
        }
    }

    notmoving(event) {
        this.ismoving = false;
    }

    die() {
        this.isdead = true;
    }
}

function start(players) {
    playerCount = players;

    for(let i = 0; i < players; i++) {
        let newPlayer = new Player(canvas.width >> 1, canvas.height >> 1);
        document.addEventListener("keydown", (event) => {newPlayer.handleInput(event);})
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

    requestAnimationFrame(mainLoop);
}

start(1);
mainLoop();