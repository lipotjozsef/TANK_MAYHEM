import {
  ctx,
  globalPlayers,
  Bullet,
  activePowerUp,
  deltaTime,
} from "./player_controller.js";
import { Vector2, Collider, globalObjects, Object, Ray } from "./core_types.js";
import { normalizeAngle, randomIntMinMax } from "./math_helper_utils.js";

export class Laser extends Object {
  //constructor(width = 50, height = 50, startX = 0, startY = 0, rotation = 0, imageName = undefined) {
  constructor(parent) {
    super(10, 10, parent.position.x, parent.position.y, parent.rotation);
    this.playerParent = parent;
    this.duration = 10;
    this.laserLenght = 0;
    this.laserSight = new Ray(0, 0, 10, 10, 0);
    this.laserSight.debugDraw = false;
  }

  delete() {
    activePowerUp[this.playerParent.playerID] = "none";
    this.laserSight.delete();
    this.playerParent.bulletCode = 0;
    super.delete();
  }

  move() {
    this.position.x = this.playerParent.position.x;
    this.position.y = this.playerParent.position.y;
    let laserGoalPos = new Vector2(this.position.x+(1000*this.playerParent.rotationMatrix[0]), this.position.y+(1000*this.playerParent.rotationMatrix[1]));
    let noozlePos = new Vector2(this.position.x+(45*this.playerParent.rotationMatrix[0]), this.position.y+(35*this.playerParent.rotationMatrix[1]));
    this.laserSight.startPos.x = noozlePos.x;
    this.laserSight.startPos.y = noozlePos.y;
    this.laserSight.goalPosition.x = laserGoalPos.x;
    this.laserSight.goalPosition.y = laserGoalPos.y;
    this.laserLenght = this.laserSight.lenghtTillWall+50;
    //console.log(this.laserSight.lenghtTillWall);

    globalPlayers.forEach(player => {
      if(player != this.playerParent) {
        if(this.laserSight.checkRadius.isColliding(player.collider)){
          player.die();
          this.visible = false;
        }
      }
    });
    
  }

  render() {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#FF0000";
    ctx.moveTo(this.position.x+(10*this.playerParent.rotationMatrix[0]), this.position.y+(10*this.playerParent.rotationMatrix[1]));
    ctx.lineTo(this.position.x+(this.laserLenght*this.playerParent.rotationMatrix[0]), this.position.y+(this.laserLenght*this.playerParent.rotationMatrix[1]))
    ctx.stroke();
    ctx.restore();
  }
  spawn() {
    globalObjects.push(this);
    
    setTimeout(()=> {
      this.delete();
    }, this.duration * 1000)
  }
}

export class Explosion extends Object {}

export class Rocket extends Object {
  constructor(positionX, positionY, parent) {
    super(8.5, 8.5, positionX, positionY, parent.rotation, "rocketbullet.png");
    this.parentPlayer = parent;
    this.collider = new Collider(this, "circle");
    this.colliding = false;
    this.lastPosition = new Vector2(positionX, positionY);
    let distances = [];
    globalPlayers.forEach((player) => {
      if (player != parent) {
        let distance = Math.sqrt(
          (player.position.x - this.position.x) ** 2 +
            (player.position.y - this.position.y) ** 2
        );
        distances.push(distance);
      }
    });
    this.target = globalPlayers[distances.indexOf(Math.min(...distances)) + 1];
    this.maxSpeed = 250;
    this.velocity = new Vector2(this.maxSpeed, this.maxSpeed);
    this.isTargetinSight = false;
  }

  move() {
    globalPlayers.forEach((player) => {
      if (this.collider.isColliding(player.collider)) {
        player.die();
        this.visible = false;
        super.delete();
      }
    });

    globalObjects.forEach((object) => {
      if (object != this) {
        if (object == this.parentPlayer) {
          this.colliding = false;
          return;
        } else if (object instanceof Bullet) {
          if (this.collider.isColliding(object.collider)) {
            this.visible = false;
            super.delete();
          }
        } else if (this.collider.isColliding(object)) {
          // RESET POSITION TO BEFORE COLLISION TO PREVENT JIGGLING
          this.position.x = this.lastPosition.x;
          this.position.y = this.lastPosition.y;

          // ROTATE BULLET AND CALMP ROTATION IN BETWEEN 0 AND 360
          if (this.rotation == 0) this.rotation = 180;
          else this.rotation += this.rotation + randomIntMinMax(1, 5);
          this.rotation = normalizeAngle(this.rotation);

          this.colliding = true;
          return;
        } else {
          this.colliding = false;
        }
      }
    });

    let Alpha = 0;
    if (Math.abs(this.velocity.x) > 0)
      Math.acos(this.velocity.x / this.velocity.lenght); //Math.acos(x / velocity.lenght)
    let piradRotation = (this.rotation + Alpha) * (Math.PI / 180);
    this.rotationMatrix = [
      parseFloat(Math.cos(piradRotation).toFixed(4)),
      parseFloat(Math.sin(piradRotation).toFixed(4)),
    ];

    this.velocity.x = this.maxSpeed * this.rotationMatrix[0];
    this.velocity.y = this.maxSpeed * this.rotationMatrix[1];

    if (!this.colliding) {
      this.lastPosition.x = this.position.x;
      this.lastPosition.y = this.position.y;
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;
    }
  }

  render() {
    super.render(this.scale.width * 2.5, this.scale.height * 1.5);
  }

  spawnBullet() {
    globalObjects.push(this);
    activePowerUp[this.parentPlayer.playerID] = "none";
    this.parentPlayer.bulletCode = 0;
  }
}

export class Shield extends Object {
  constructor(width, height, parent) {
    super(
      width,
      height,
      parent.position.x,
      parent.position.y,
      0,
      "shield_bubble_text.png"
    );
    this.parentPlayer = parent;
    this.duration = 15;
    this.freq = -1 * (this.duration - 5);
    this.shieldCollider = new Collider(this, "circle", 6, [2, 5]);
    this.timeAlive = 0;
    globalObjects.push(this);
    setInterval(() => {
      this.freq += 1;
    }, 1000);
    setTimeout(() => {
      this.visible = false;
      this.delete();
    }, this.duration * 1000);
  }

  delete() {
    activePowerUp[this.parentPlayer.playerID] = "none";
    super.delete();
  }

  move() {
    this.position.x = this.parentPlayer.position.x;
    this.position.y = this.parentPlayer.position.y;
  }

  render() {
    this.timeAlive += deltaTime;
    let opacity =
      0.5 * (1 + Math.sin(2 * Math.PI * this.freq * this.timeAlive));
    if (this.freq <= 0) opacity = 1;
    super.render(this.scale.width * 2.5, this.scale.height * 2.5, opacity);
  }
}
