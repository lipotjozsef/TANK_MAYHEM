import { Vector2 } from "./core_types.js";

export function clamp(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

export function randomIntMinMax(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function normalizeAngle(angle) {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

export function calcRotMatrix(object) {
  if (object.velocity == undefined || object.rotation == undefined) {
    console.assert(`Not object passed ${object}`);
    return [0, 0];
  }
  let Alpha = 0;
  if (Math.abs(object.velocity.x) > 0)
    Math.acos(object.velocity.x / object.velocity.lenght); //Math.acos(x / velocity.lenght)
  let piradRotation = (object.rotation + Alpha) * (Math.PI / 180);
  return [
    parseFloat(Math.cos(piradRotation).toFixed(4)),
    parseFloat(Math.sin(piradRotation).toFixed(4)),
  ];
}

export function getPositionFromPlayer(object, playerFrom, distance) {
    if(object.position == undefined) console.assert(`Not object was given ${object}`);
    return new Vector2(object.position.x+(distance*playerFrom.rotationMatrix[0]), object.position.y+(distance*playerFrom.rotationMatrix[1]));
}