"use strict";

const canvas = document.getElementById("canvas");
const graphics = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

let dx = 2;

let dxScale = 10/93; 

let dy = -2;

let wait = 0;

let leftPressed = false;
let rightPressed = false;

let score = 0;
let level = 1;
let amount = 0;
let normal = 10000;
let timeUntilNoAnimations = normal; 

let reloading = false;

//originally at 2 rows and 3 columns

let originalCols = 3;
let originalRows = 2;

let cols = originalCols;
let rows = originalRows;
let brickWidth = width/cols;
let brickHeight = 100;
let bricks = [];
let bricksBroken = 0;

for (let i = 0; i < cols; i++) {
	bricks[i] = [];
	for (let j = 0; j < rows; j++) {
		bricks[i][j] = new Brick(i*brickWidth, j*brickHeight + 60, brickWidth, brickHeight, "red", true);
		bricks[i][j].status = 1;
	}
}

function random(min, max) {
	return Math.floor(Math.random() * (max-min+1))+min;
}

document.addEventListener("keydown", function(e) {
	if (e.keyCode == 37) {
		leftPressed = true;
	} else if (e.keyCode == 39) {
		rightPressed = true;
	}
});

document.addEventListener("keyup", function(e) {
	if (e.keyCode == 37) {
		leftPressed = false;
	} else if (e.keyCode == 39) {
		rightPressed = false;
	}
});

function Brick(x, y, w, h, fill, stroke) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.fill = fill;
	this.stroke = stroke;
}

Brick.prototype.draw = function() {
	graphics.fillStyle = this.fill;

	if (!this.stroke) {
		graphics.fillRect(this.x, this.y, this.w, this.h);
	} else {
		graphics.beginPath();
		graphics.strokeStyle = "black";
		graphics.lineWidth = 0.5;
		graphics.rect(this.x, this.y, this.w, this.h);
		graphics.closePath();
		graphics.fill();
		graphics.stroke();
	}
};

Brick.prototype.hits = function(obj) {
	if (this.x+this.w > obj.x && this.x < obj.x+obj.w && this.y+this.h > obj.y && this.y < obj.y+obj.h) {
		return true;
	} 

	return false;
};

function reset() {
	ball.x = width/2-10;
	ball.y = height-40;
	player.x = width/2-player.w/2;

	if (random(0, 1)) {
		dx = -2;
	} else {
		dx = 2;
	}

	dxScale = 10/93;
	dy = -2;

	wait = 0;
}

function hardReset() {
	reset();

	score = 0;
	level = 1;
	bricksBroken = 0;
	cols = originalCols;
	rows = originalRows;
	brickWidth = width/cols;
	brickHeight = 100;

	bricks = [];

	for (let i = 0; i < cols; i++) {
		bricks[i] = [];
		for (let j = 0; j < rows; j++) {
			bricks[i][j] = new Brick(i*brickWidth, j*brickHeight + 60, brickWidth, brickHeight, "red", true);
			bricks[i][j].status = 1;
		}
	}
}

function nextLevel() {
	timeUntilNoAnimations = normal;
	reset();
		
	level++;
	bricksBroken = 0;
	cols *= 2;
	rows *= 2;
	brickWidth = width/cols;
	brickHeight = 200/rows;

	bricks = [];

	for (let i = 0; i < cols; i++) {
		bricks[i] = [];
		for (let j = 0; j < rows; j++) {
			bricks[i][j] = new Brick(i*brickWidth, j*brickHeight + 60, brickWidth, brickHeight, "red", true);
			bricks[i][j].status = 1;
		}
	}
}

let player = new Brick(width/2-37.5, height-20, 75, 15, "white", false);

//let ball = new Brick(width/2-10, height-40, 20, 20, "cyan", false);
let ball = new Brick(width/2-10, player.y-20, 20, 20, "cyan", false);

function draw() {
	if (timeUntilNoAnimations > 0) {
		graphics.fillStyle = "black";
		graphics.fillRect(0, 0, width, height);
	}

	timeUntilNoAnimations--;

	player.draw();

	graphics.font = "25px Arial";
	graphics.fillText("Score: " + score, 10, 25);
	graphics.fillText("Level: " + level, width/2-25, 25);

	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			if (bricks[i][j].status == 1) {
				bricks[i][j].draw();

				if (bricks[i][j].hits(ball)) {
					bricks[i][j].status = 0;
					bricksBroken++;

					if (ball.x+ball.w < bricks[i][j].x+ball.w/2) {
						dx = -Math.abs(dx);
					} else if (ball.x > bricks[i][j].x+bricks[i][j].w-ball.w/2){
						dx = Math.abs(dx);
					}

					if (ball.y < bricks[i][j].y+bricks[i][j].h && ball.y > bricks[i][j].y+bricks[i][j].h*(5/6)) {
						dy = Math.abs(dy);
					} else if (ball.y+ball.h > bricks[i][j].y && ball.y+ball.h < bricks[i][j].y+bricks[i][j].h*(1/6)) {
						dy = -Math.abs(dy);
					}

					score += 20;
				}
			}
		}
	}

	if (level >= 3) {
		amount++;
		alert(`You are a Breakout Grandmaster!!!!! (times ${amount})`);
	}

	ball.draw();

	if (ball.x < 0) {
		dx *= -1;
	} else if (ball.x+ball.w > width) {
		dx *= -1;
	}

	if (ball.y < 0) {
		dy *= -1;
	} else if (ball.y > height-ball.h/2 && !reloading) {
		alert("You Lose!!!")
		location.reload();
		reloading = true;
	}

	if (cols*rows == bricksBroken) {
		nextLevel();
	}

	if (ball.hits(player) && dy > 0) {
		dxScale += .1;
		dx = ((ball.x+ball.w/2)-(player.x+player.w/2))*dxScale;

		dy += 1/2;
		dy *= -1;
	}

	if (wait == 50) {
		ball.x += dx;
		ball.y += dy;

		if (leftPressed && player.x > 0) {
			player.x -= 7;
		} else if (rightPressed && player.x < width-player.w) {
			player.x += 7;
		}
	}
}

function update() {
	draw();

	if (wait < 50) {
		wait++;
	}

	requestAnimationFrame(update);
}

update();