/*
TO-DO
--
double tap
arrow indicates first jumps
*/
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var canvasX = window.innerWidth;
var canvasY = window.innerHeight;
var centerX = window.innerWidth/2;
var centerY = window.innerHeight/2;

var timeline = 0;
var player;
var platform;
var platforms = [];
var points = 0;

var pause = true;
var savedPoints = 0;

var recordPoints;
if(window.localStorage.getItem("recordPoints") !== "undefined") {
  recordPoints = window.localStorage.getItem("recordPoints");
} else {
  recordPoints = 0;
} 

var distance = Math.floor(((canvasX * 6) / 100));

var lastPress;
var KEY_SPACE=32;
var player = new Player();


function init() {
	resizeCanvas();
	startScreen();
	createPlatform();	
}

function startScreen() {
	if(pause) {
		document.addEventListener("click", function(evt){
    	pause = false;
    	});
    	document.addEventListener("touchstart", function(evt){
    		//evt.stopPropagation();
    		pause = false;
    	});
    	document.addEventListener('keypress', function(e){
            lastPress=e.keyCode || e.charCode;
            if(lastPress==KEY_SPACE) {
            	pause = false;
            } 
		});
		points = 0;
		ctx.textAlign = 'center';
		ctx.fillStyle = "rgba(0,0,0,0.9)";
		ctx.fillRect(0,0,canvasX,canvasY);
		ctx.fillStyle = "white";
		if(recordPoints > 0) {
			ctx.font="4vw 'Press Start 2P'";
			ctx.fillText("Record:" + recordPoints,centerX-10, 100); 
		} 
		if(savedPoints > 0) {
			ctx.font="2vw 'Press Start 2P'";
			ctx.fillText(savedPoints + " points",centerX-10, 210); 
		} else {
			ctx.font="1vw 'Press Start 2P'";
			ctx.fillText("Double click - Double Jump",centerX-10, 190); 
		}
		
		ctx.font="3vw 'Press Start 2P'";
		ctx.fillText("Click to start",centerX-10, 160);		
		ctx.fill();
	}
}


function randomRange(min,max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resizeCanvas() {
	canvasY = window.innerHeight;
	canvasX = window.innerWidth;
	pixelsize = canvasY *.1;
    canvas.width = window.innerWidth - 5;
    canvas.height = window.innerHeight - 5;
    centerX = window.innerWidth / 2;
	centerY = window.innerHeight / 2;
	distance = Math.floor(((canvasX * 6) / 100));
}

function Player() {
	this.x = canvasX / 5;
	this.y = 70;
	this.r =  canvasX / (canvasX / 4);
	this.vx = 6;
	this.vy = 4;
	this.time = 0;
	this.onFloor = false;
	this.isJumping = false;
	this.jump = 1;
	this.n_jumps = 0;
	this.force = 0;
	this.vspeed = 0;
	this.gravity = 2.3;
	this.color = "salmon";
}

Player.prototype.draw = function() {
	ctx.beginPath();
	ctx.save();
	ctx.arc(this.x,this.y,this.r,0, 2 * Math.PI);
	ctx.fillStyle = this.color;
	ctx.fill();
	ctx.restore();
}

Player.prototype.control = function() {
	if(!pause) {

			// para calcular la siguiente posicion en funcion a la velocidad que lleva. Y posteriormente sumarselo a la "y" del objeto para que se pose sobre la plataforma correctamente 
			this.vspeed=(this.gravity * this.time) - this.force;
			this.y += this.vspeed;

			if(this.y < canvasY-10) {

				for (var i = 0; i < platforms.length; i++) {
					if((this.x < platforms[i].x - 10 || this.x > (platforms[i].x + platforms[i].w)) ||  (this.y - this.vspeed) > platforms[i].y+platforms[i].h ||  (this.y + this.vspeed + this.vy) < platforms[i].y) {
						this.onFloor=false;	
						//platforms[i].color = "black";
					} else {
						this.onFloor=true;
						this.force=0;
						platforms[i].color = "salmon";
						break;
					}	
				}

				if(!this.onFloor) { 
					//falling	
					this.time += 0.1;

				} else { 
					//onfloor
					points++;
					savedPoints = points;
					if(savedPoints >= recordPoints) {
						recordPoints = savedPoints;
						window.localStorage.setItem("recordPoints", recordPoints);
					}
					//if(recordPoints < savedPoints) recordPoints = savedPoints;
					this.vspeed = 0;
					this.time = 0;
					this.n_jumps = 0;
				}
				
			} else {
				//offcanvas
				this.vspeed = 0;
				this.y = 70;
				this.time = 0;
				this.force = 0;
				this.n_jumps = 0;
				pause=true;
			}
			
	}
	       
}

Player.prototype.jumping = function() {
	if(this.n_jumps < 2){
		this.force += 5;
		this.time = 0;
	}
	this.n_jumps++;
}


function yPlatform() {
	var yArr = [10,20,30,40,50,60];
	var yPos = yArr[Math.floor(Math.random() * yArr.length)];
	var yPlatform = (canvasY / 2) + yPos;
	return yPlatform;
}

function createPlatform(){
	platform = {
		x:canvasX,
		y:yPlatform(),
		w:(canvasX * 20) / 100,
		h:randomRange(5,6),
		velocity:randomRange(5.5,6.7),
		color:"#81F563",
		draw : function() {
			ctx.beginPath();
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x,this.y,this.w,this.h);
			ctx.fill();
			ctx.closePath();
		},
		move:function(){
			this.x -= 1 * this.velocity;
		}
	}
	platforms.push(platform);
}


function render() {
	ctx.clearRect(0,0,canvasX,canvasY);
	timeline++;
	ctx.font="5vw 'Press Start 2P'";
	ctx.fillText(points,centerX, 130); 
	player.draw();
	player.control();

	if(timeline % distance == 0) {
		createPlatform();
	}
	
	for (var i = 0; i < platforms.length; i++) {
		platforms[i].move();
		platforms[i].draw();
		
		if(platforms[i].x < -700) {
			platforms.shift();
		}
	}

	if(pause) {
		startScreen();
	}
}


//controls
document.addEventListener('keypress', function(e){
        lastPress=e.keyCode || e.charCode;
        if(lastPress==KEY_SPACE) {
        	player.jumping();
        }  
});

document.addEventListener("touchstart", function(e){
	e.stopPropagation();
	player.jumping();
});
document.addEventListener("click", function(e){
	player.jumping();
});

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function(callback){
            window.setTimeout(callback, 1000 / 60);
          };
})();

init();


(function animloop(){	
  requestAnimFrame(animloop);
  render();
})();


window.addEventListener("resize", resizeCanvas,true);
//window.onresize = resizeCanvas;