import {
  ctx,
  globalPlayers,
  Bullet,
  activePowerUp,
  deltaTime,
} from "./player_controller.js";
import { Vector2, Collider, globalObjects, Object, Ray } from "./core_types.js";
import { normalizeAngle, randomIntMinMax, calcRotMatrix, getPositionFromPlayer } from "./math_helper_utils.js";
export class Laser extends Object {
  constructor(parent) {
    super(10, 10, parent.position.x, parent.position.y, parent.rotation);
    this.playerParent = parent;
    this.duration = 10;
    this.laserLenght = 0;
    this.freq = -1 * (this.duration - 5);
    this.timeAlive = 0;
    setInterval(() => {
      this.freq += 1;
    }, 1000);
    
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
    let laserGoalPos = getPositionFromPlayer(this, this.playerParent, 1000);
    let noozlePos = getPositionFromPlayer(this, this.playerParent, 45);
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
    this.timeAlive += deltaTime;
    let opacity =
      0.5 * (1 + Math.sin(2 * Math.PI * this.freq * this.timeAlive));
    if (this.freq <= 0) opacity = 1;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.strokeStyle = "#FF0000";
    let drawNoozlePos = getPositionFromPlayer(this, this.playerParent, 10);
    let laserPos = getPositionFromPlayer(this, this.playerParent, this.laserLenght);
    ctx.moveTo(drawNoozlePos.x, drawNoozlePos.y);
    ctx.lineTo(laserPos.x, laserPos.y)
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ctx.restore();
  }
  spawn() {
    globalObjects.push(this);
    
    setTimeout(()=> {
      this.delete();
    }, this.duration * 1000)
  }
}

export class Explosion extends Object {
  //constructor(width = 50, height = 50, startX = 0, startY = 0, rotation = 0, imageName = undefined) {
  constructor(posX, posY, parent) {
    super(10, 10, posX, posY, parent.rotation, "bomb.png");
    this.bombCollider = new Collider(this, "circle", 2, [1, 3, 6])
    this.colliding = false;
    this.lastPosition = new Vector2(posX, posY);
    this.parentPlayer = parent;
    this.maxSpeed = 200;
    this.rotationMatrix = [0, 0];
    this.hits = 0;
  }

  spawnBulletsAround() {
    for(let i = 0; i != 360; i+=45) {
      this.rotation = i;
      this.rotationMatrix = calcRotMatrix(this);
      let bulletSpawn = getPositionFromPlayer(this, this, 20);
      let newSmallBullet = new Bullet(8.5, 8.5, bulletSpawn.x, bulletSpawn.y, this.rotation);
      newSmallBullet.spawn(this.parentPlayer);
    }
  }

  move() {

    if(this.hits >= 10) {
      this.spawnBulletsAround();
      this.bombCollider.delete();
      this.delete();
    }

    globalPlayers.forEach(player => {
      if(this.bombCollider.isColliding(player.collider)) {
        this.hits = 10;
      }
    })

    globalObjects.forEach(object => {
      if(this.bombCollider.isColliding(object)) {
        this.colliding = true;
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
      this.position.x = this.lastPosition.x;
      this.position.y = this.lastPosition.y;
      if(this.rotation == 0) this.rotation = 180;
      else this.rotation += this.rotation + randomIntMinMax(10, 25);
      this.rotation = normalizeAngle(this.rotation);
    }
    this.colliding = false;
  }

  render() {
    super.render(this.scale.width*2.2, this.scale.height*2.2, 1);
  }

  spawn() {
    globalObjects.push(this);
    activePowerUp[this.parentPlayer.playerID] = "none";
    this.parentPlayer.bulletCode = 0;
  }
}


export class Rocket extends Object {
  constructor(positionX, positionY, parent) {
    super(8.5, 8.5, positionX, positionY, parent.rotation, "rocketbullet.png");
    this.parentPlayer = parent;
    this.timeUntilExplosion = 30;
    this.timeUntilSelfTarget = 15;
    this.collider = new Collider(this, "circle", 9, [1, 2, 3, 6]);
    this.colliding = false;
    this.lastPosition = new Vector2(positionX, positionY);
    this.deleted = false;
    this.timeAlive = 0;

    let distances = [];
    globalPlayers.forEach((player) => {
      if (player != parent) {
        let distance = Math.sqrt(
          (player.position.x - this.position.x) ** 2 +
            (player.position.y - this.position.y) ** 2
        );
        distances.push(distance);
      } else {
        distances.push(2000);
      }
    });
    setTimeout(() => {
      this.target = this.parentPlayer;
      this.isTargetinSight = false;
    }, this.timeUntilSelfTarget * 1000);

    setTimeout(()=> {
      this.delete();
    }, this.timeUntilExplosion * 1000)

    this.target = globalPlayers[distances.indexOf(Math.min(...distances))];
    this.maxSpeed = 250;
    this.velocity = new Vector2(this.maxSpeed, this.maxSpeed);
    console.log(this.target);
    this.rocketSight = new Ray(
      positionX,
      positionY,
      this.target.position.x,
      this.target.position.y,
      0);

    this.isTargetinSight = false;

    this.rocketSight.debugDraw = false;
  }

  delete() {
    if(this.deleted) return;
    this.deleted = true;
    this.collider.delete();
    this.rocketSight.delete();
    super.delete();
  }

  move() {
    this.rocketSight.startPos.x = this.position.x;
    this.rocketSight.startPos.y = this.position.y;
    this.rocketSight.goalPosition.x = this.target.position.x;
    this.rocketSight.goalPosition.y = this.target.position.y;

    if(this.rocketSight.canReachGoal) {
      this.isTargetinSight = true;
    }

    globalPlayers.forEach((player) => {
      if (this.collider.isColliding(player.collider)) {
        player.die();
        this.visible = false;
        this.delete();
      }
    });

    globalObjects.forEach((object) => {
      if (object != this) {
        if (object == this.parentPlayer) {
          this.colliding = false;
          return;
        } else if (object instanceof Bullet || object instanceof Shield) {
          if (this.collider.isColliding(object.collider)) {
            this.visible = false;
            this.delete();
          }
        } else if (this.collider.isColliding(object)) {
          this.colliding = true;
        }
      }
    });

    this.rotationMatrix = calcRotMatrix(this);

    this.velocity.x = this.maxSpeed * this.rotationMatrix[0];
    this.velocity.y = this.maxSpeed * this.rotationMatrix[1];

    if (!this.colliding) {
      this.lastPosition.x = this.position.x;
      this.lastPosition.y = this.position.y;
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;
    } else {
      // RESET POSITION TO BEFORE COLLISION TO PREVENT JIGGLING
      this.position.x = this.lastPosition.x;
      this.position.y = this.lastPosition.y;

      // ROTATE BULLET AND CALMP ROTATION IN BETWEEN 0 AND 360
      if(!this.isTargetinSight) {
        if (this.rotation == 0) this.rotation = 180;
        else this.rotation += this.rotation + randomIntMinMax(1, 5);
      }
      this.rotation = normalizeAngle(this.rotation);
      
    }
    if(this.isTargetinSight) this.rotation = this.rocketSight.angleToTarget;
    this.colliding = false;
  }

  render() {
    super.render(this.scale.width * 2.5, this.scale.height * 1.5);
    ctx.save();
    this.timeAlive += deltaTime;
    let radius = 0.5 * (10 + Math.sin(2 * Math.PI * this.timeAlive) * 10);
    let opacity = 0.5 * (1 + Math.sin(2 * Math.PI * this.timeAlive));
    if (this.freq <= 0) opacity = 1;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    
    switch(this.target.playerID) {
      case 0:
        ctx.fillStyle = "#FF0000";
        break;
      case 1:
        ctx.fillStyle = "#00FF00";
        break;
      case 2:
        ctx.fillStyle = "#0000FF";
        break;
    }
    ctx.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
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
    this.collider = new Collider(this, "circle", 6, [2, 5, 9]);
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
    this.collider.delete();
    super.delete();
    this.parentPlayer.canDie = true;
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
