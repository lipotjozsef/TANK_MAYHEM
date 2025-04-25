import { MazeGenerator } from "./mazegenerator.js";
import { clamp } from "./math_helper_utils.js";

export var globalObjects = [];

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
export var mazeGenerator = new MazeGenerator(21, 17, canvas);

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
    super(x, y);
  }

  get lenght() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
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
  constructor(
    width = 50,
    height = 50,
    startX = 0,
    startY = 0,
    rotation = 0,
    imageName = undefined
  ) {
    this.scale = new Point(width, height);
    this.position = new Point(startX, startY);
    this.velocity = new Vector2(0, 0);
    this.rotation = rotation;
    this.visible = true;
    this.imageLoaded = false;
    if (imageName != undefined) {
      this.spriteImage = new Image();
      this.spriteImage.src = `./assets/${imageName}`;
      this.spriteImage.onload = () => {
        this.imageLoaded = true;
      };
    }
  }

  render(width = 0, height = 0, opacity = 1.0) {
    if (!this.visible) return;
    if (this.imageLoaded) {
      ctx.save();
      ctx.translate(this.position.x, this.position.y); // Position the rect to the center
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity;
      ctx.drawImage(this.spriteImage, -width >> 1, -height >> 1, width, height);
      ctx.globalAlpha = 1.0;
      ctx.restore();
    }
  }

  delete() {
    if (this.collider != undefined)
      globalObjects.splice(globalObjects.indexOf(this.collider), 1);
    globalObjects.splice(globalObjects.indexOf(this), 1);
  }
}

export class Ray extends Object {
  constructor(startX, startY, goalX, goalY, rotation) {
    super(10, 10, startX, startY, rotation);
    this.step = 20;
    this.goalPosition = new Vector2(goalX, goalY);
    this.startPos = new Vector2(startX, startY);
    this.lenght = 0;
    this.checkRadius = new Collider(this, "circle", 5, [1, 3, 5, 6]);
    let goalObject = new Object(10, 10, goalX, goalY, 0);
    this.goalCheck = new Collider(goalObject, "circle", 5, [5]);
    this.gainLenght = false;
    this.rotationMatrix = [1, 0];
    this.angleToTarget = 0;
    this.beforeLenght = 0;
    this.debugDraw = true;
    globalObjects.push(this);
  }

  delete() {
    this.checkRadius.delete();
    this.goalCheck.delete();
    super.delete();
  }

  get lenghtTillWall() {
    return Math.sqrt(
      (this.position.x - this.startPos.x) ** 2 +
        (this.position.y - this.startPos.y) ** 2
    );
  }

  get canReachGoal() {
    return this.goalCheck.isColliding(this.checkRadius);
  }

  move() {
    this.position.x = this.startPos.x;
    this.position.y = this.startPos.y;
    this.lenght = 0;
    for (let i = 0; i < 100; i++) {
      let piradRotation = Math.atan2(
        this.goalPosition.y - this.position.y,
        this.goalPosition.x - this.position.x
      );
      this.angleToTarget = piradRotation * 180;
      this.rotationMatrix = [
        parseFloat(Math.cos(piradRotation).toFixed(4)),
        parseFloat(Math.sin(piradRotation).toFixed(4)),
      ];

      this.position.x = this.startPos.x + this.lenght * this.rotationMatrix[0];
      this.position.y = this.startPos.y + this.lenght * this.rotationMatrix[1];
      globalObjects.forEach((wall) => {
        if (wall instanceof Collider) {
          if (this.checkRadius.isColliding(wall)) {
            this.gainLenght = true;
          }
        }
      });

      this.beforeLenght = this.lenght;
      if (!this.gainLenght && this.lenght < 2000) {
        this.lenght += this.step;
      }
      this.gainLenght = false;

      if (this.beforeLenght == this.lenght) break;
    }
  }

  render() {
    if (!this.debugDraw) return;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#0000FF";
    ctx.moveTo(this.startPos.x, this.startPos.y);
    ctx.lineTo(this.position.x, this.position.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#00FF00";
    ctx.arc(
      this.checkRadius.position.x,
      this.checkRadius.position.y,
      this.scale.width,
      0,
      Math.PI * 2,
      false
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#FF0000";
    ctx.arc(
      this.goalPosition.x,
      this.goalPosition.y,
      this.scale.width * 2,
      0,
      Math.PI * 2,
      false
    );
    ctx.stroke();
    ctx.restore();
  }
}

export class Collider extends Object {
  constructor(parent, type, layer = 1, mask = [1]) {
    super();
    this.type = type;
    this.parent = parent;
    this.iscolliding = false;
    this.layer = layer; // What this collider is
    this.mask = mask; // What this collider interacts with
    globalObjects.push(this);
  }

  isColliding(collider) {
    if (this == collider) return false;

    if (!this.mask.includes(collider.layer)) return false;
    if (!collider.mask.includes(this.layer)) return false;

    if (this.type == "rectangle" && collider.type == "rectangle") {
      if (
        this.parent.position.x + this.parent.scale.width >=
          collider.parent.position.x &&
        this.parent.position.x <=
          collider.parent.position.x + collider.parent.scale.width &&
        this.parent.position.y + this.parent.scale.height >=
          collider.parent.position.y &&
        this.parent.position.y <=
          collider.parent.position.y + collider.parent.scale.height
      ) {
        this.iscolliding = true;
        return true;
      } else {
        this.iscolliding = false;
        return false;
      }
    } else if (this.type == "circle" && collider.type == "rectangle") {
      let closestPoint = new Vector2(
        clamp(
          collider.parent.position.x - collider.parent.scale.width / 2,
          collider.parent.position.x + collider.parent.scale.width / 2,
          this.parent.position.x
        ),
        clamp(
          collider.parent.position.y - collider.parent.scale.height / 2,
          collider.parent.position.y + collider.parent.scale.height / 2,
          this.parent.position.y
        )
      );

      let distance = parseFloat(
        Math.sqrt(
          (closestPoint.x - this.parent.position.x) ** 2 +
            (closestPoint.y - this.parent.position.y) ** 2
        ).toFixed(4)
      );

      if (distance <= this.scale.width) return true;
      else return false;
    } else if (this.type == "circle" && collider.type == "circle") {
      let SquaredDistance =
        (this.parent.position.x - collider.parent.position.x) ** 2 +
        (this.parent.position.y - collider.parent.position.y) ** 2;

      if (SquaredDistance <= (this.scale.width + collider.scale.width) ** 2)
        return true;
      else return false;
    }
  }

  move() {}

  render() {
    super.render();
    this.position = this.parent.position;
    this.rotation = this.parent.rotation;
    this.scale = this.parent.scale;

    /*
    ctx.save();

    if (!this.iscolliding) ctx.strokeStyle = "#00FF00";
    else ctx.strokeStyle = "#FF0000";

    ctx.lineWidth = 5;

    if (this.type == "rectangle") {
      ctx.translate(this.position.x, this.position.y); // Position the rect to the center
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.beginPath();
      ctx.rect(
        -this.scale.width / 2,
        -this.scale.height / 2,
        this.scale.width,
        this.scale.height
      );
      ctx.stroke();
    }
    if (this.type == "circle") {
      ctx.beginPath();
      ctx.arc(
        this.position.x,
        this.position.y,
        this.scale.width,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    ctx.restore();*/
  }
}

export function cleanObjects() {
  globalObjects.length = 0;
  mazeGenerator = new MazeGenerator(21, 17, canvas);
}
