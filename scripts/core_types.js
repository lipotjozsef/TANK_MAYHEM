import { clamp } from "./math_helper_utils.js";
export const globalObjects = [];

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = x;
        this.height = y;
    }
}

export class Vector2 extends Point {
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

export class Object {
    constructor(width = 50, height = 50, startX = 0, startY = 0, rotation = 0) {
        this.scale = new Point(width, height);
        this.position = new Point(startX, startY)
        this.velocity = new Vector2(0, 0);
        this.rotation = rotation;
        this.visible = true;
    }

    render() {
        if(!this.visible) return;
    }

    delete() {
        if(this.collider != undefined) globalObjects.splice(globalObjects.indexOf(this.collider), 1);
        globalObjects.splice(globalObjects.indexOf(this), 1);
    }
}

export class Collider extends Object {
    constructor(parent, type) {
        super();
        this.type = type;
        this.parent = parent;
        this.iscolliding = false;
        globalObjects.push(this);
    }


    isColliding(collider) {
        if(this == collider) return false;
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
                clamp(collider.parent.position.x-collider.parent.scale.width/2,collider.parent.position.x + collider.parent.scale.width/2,this.parent.position.x),
                clamp(collider.parent.position.y-collider.parent.scale.height/2,collider.parent.position.y + collider.parent.scale.height/2,this.parent.position.y)
            );

            let distance = parseFloat(Math.sqrt((closestPoint.x - this.parent.position.x)**2 + (closestPoint.y - this.parent.position.y)**2).toFixed(4));

            if(distance <= this.scale.width) return true;
            else return false;
        }
        else if(this.type == "circle" && collider.type == "circle") {
            let SquaredDistance = (this.parent.position.x - collider.parent.position.x)**2 + (this.parent.position.y - collider.parent.position.y)**2;

            if(SquaredDistance <= ((this.scale.width + collider.scale.width)**2)) return true;
            else return false;
        }
        
    }

    move() {

    }

    render() {
        super.render()
        this.position = this.parent.position;
        this.rotation = this.parent.rotation;
        this.scale = this.parent.scale;

        ctx.save();

        if (!this.iscolliding) ctx.strokeStyle = "#00FF00";
        else ctx.strokeStyle = "#FF0000";

        ctx.lineWidth = 5;

        if(this.type == "rectangle") {
            ctx.translate(this.position.x, this.position.y); // Position the rect to the center
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.beginPath();
            ctx.rect(-this.scale.width/2, -this.scale.height/2, this.scale.width, this.scale.height);
            ctx.stroke();
        }
        if(this.type == "circle") {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.scale.width, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}