export class PowerUp{

    
    constructor(canvas, X, Y, radius, scale, padding, typeNumber = 0) {

        this.typeList = ["explode", "shield", "laser"]
        this.type = this.typeList[typeNumber]
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = X
        this.y = Y
        this.radius = radius,
        this.scale = scale
        this.padding = padding
    }

    spawnPowerUp()
    {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "black"
        this.ctx.lineWidth = 5
        this.ctx.arc(this.x * this.scale + this.radius + this.padding, this.y * this.scale + this.radius + this.padding, this.radius, 0, 2 * Math.PI)
        this.ctx.stroke();
        this.ctx.fillStyle = "yellow"
        this.ctx.fill()
    }

    disspawnPowerUp()
    {
        this.ctx.fillStyle = "white"
        this.ctx.fillRect(this.x * this.scale, this.y * this.scale, this.scale, this.scale)
    }
}