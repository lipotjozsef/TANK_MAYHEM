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