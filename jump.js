/*
TODO
--
review collision
googlefonts - Press Star
Spacebar-jump
*/
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var marker = document.getElementById("marker");
var timeline = 0;
var player;
var platform;
var platforms = [];
var points = 0;

var pause = true;
var savedPoints = 0;
var recordPoints = 0;

var canvasX = window.innerWidth;
var canvasY = window.innerHeight;
var centerX = window.innerWidth/2;
var centerY = window.innerHeight/2;

/*
var keys = [];
var pressing=[];
var lastPress;
var KEY_ENTER=13;
var KEY_LEFT=37;
var KEY_UP=38;
var KEY_RIGHT=39;
var KEY_DOWN=40;
var KEY_DISP=65;
*/

function init() {
	resizeCanvas();
	startScreen();
	createPlatform();
	createPlayer();

}

function startScreen() {
	if(pause) {
		document.addEventListener("click", function(evt){
    	pause = false;
    });
		points = 0;
		//ctx.beginPath();
		ctx.textAlign = 'center';
		ctx.fillStyle = "rgba(0,0,0,0.9)";
		ctx.fillRect(0,0,canvasX,canvasY);
		ctx.fillStyle = "white";
		if(recordPoints > 0) {
			ctx.font="40px Lucida Console";
			ctx.fillText("Record: " + recordPoints,centerX-10, 100); 
		} 
		if(savedPoints > 0) {
			ctx.font="18px Lucida Console";
			ctx.fillText(savedPoints + " points",centerX-10, 210); 
		} else {
			ctx.font="16px Lucida Console";
			ctx.fillText("Double click - Double Jump",centerX-10, 180); 
		}
		
		ctx.font="26px Lucida Console";
		ctx.fillText("Click to start",centerX-10, 150);		
		ctx.fill();
		//ctx.closePath();
	}
	
}


function randomRange(min,max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resizeCanvas() {
	canvasX = window.innerWidth;
	canvasY = window.innerHeight;
	pixelsize = canvasY *.1;
    canvas.width = window.innerWidth - 5;
    canvas.height = window.innerHeight - 5;
}


function createPlayer() {
	document.addEventListener('keydown', function(evt){
            lastPress=evt.keyCode;
            pressing[evt.keyCode]=true;
	        },false);

    document.addEventListener('keyup', function(evt){
        pressing[evt.keyCode]=false; 
        player.isJumping=false;

    },false);

    document.addEventListener("click", function(evt){
    	player.jump();
    });

	player = {
		x: canvasX / 5,
		y: 0,
		r: 4,
		vx: 6,
		vy: 4,
		time: 0,
		onFloor: false,
		isJumping:false,
		jump:1,
		n_jumps: 0,
		force:0,
		vspeed:0,
		gravity: 2.3,
		color: "salmon",
		draw: function(){
			ctx.beginPath();
			ctx.save();
			ctx.arc(this.x,this.y,this.r,0, 2 * Math.PI);
			ctx.fillStyle = this.color;
			ctx.fill();
			ctx.restore();
		},
		control:function(){
			if(!pause) {

			// para calcular la siguiente posicion en funcion a la velocidad que lleva. Y posteriormente sumarselo a la "y" del objeto para que se pose sobre la plataforma correctamente 
			this.vspeed=(this.gravity * this.time) - this.force;
			this.y += this.vspeed;

			if(this.y < canvasY-10) {

				for (var i = 0; i < platforms.length; i++) {
					if((this.x < platforms[i].x || this.x > (platforms[i].x + platforms[i].w)) ||  (this.y - this.vspeed) > platforms[i].y+platforms[i].h ||  (this.y + this.vspeed + 5) < platforms[i].y) {
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
					if(recordPoints < savedPoints) recordPoints = savedPoints;
					this.vspeed = 0;
					this.time = 0;
					this.n_jumps = 0;
				}
				
			} else {
				//offcanvas
				this.vspeed = 0;
				this.y = 0;
				this.time = 0;
				this.force = 0;
				this.n_jumps = 0;
				pause=true;
			}
			
			}
	       
	       /*  
	        if(pressing[KEY_RIGHT]){ this.x+=1 * this.vx; }
	        if(pressing[KEY_DOWN]){this.y+=1  * this.vy; }   
	        if(pressing[KEY_LEFT]){this.x-=1 * this.vx; }
	        */
		},
		jump : function() {		
			if(this.n_jumps < 2){
				this.force += 5;
				this.time = 0;
			}
			this.n_jumps++;
		}		
	}
}


function createPlatform(){
	platform = {
		x:canvasX-200,
		y:randomRange((canvasY /2) +10 ,(canvasY /2)+40),
		w:randomRange(150,300),
		h:randomRange(5,6),
		velocity:randomRange(5,5.6),
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
	marker.innerHTML = points;
	player.draw();
	player.control();

	if(timeline % 60 == 0) {
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


window.addEventListener("resize", resizeCanvas);