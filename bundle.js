/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const Game = __webpack_require__(1);
	
	document.addEventListener("DOMContentLoaded", Game.init);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const Player = __webpack_require__(2);
	const Canvas = __webpack_require__(5);
	const Scape = __webpack_require__(6);
	const Color = __webpack_require__(3);
	
	// global singleton canvas, or too dangerous?
	
	function Game(){
	  this.canvas = new Canvas;
	  const scape1 = new Scape(this.canvas, -1, -3);
	  const scape2 = new Scape(this.canvas, 1, -3);
	  this.scapes = [scape1, scape2];
	  this.player = new Player(this.scapes);
	}
	
	Game.init = function(){
	  const game = new Game;
	  game.run();
	};
	
	Game.prototype.render = function(){
	  this.canvas.render();
	  this.scapes.forEach( scape => {
	    scape.render();
	  });
	  this.player.render(this.canvas.ctx);
	};
	
	Game.prototype.move = function () {
	  this.scapes.forEach( scape => {
	    scape.move();
	  });
	  this.player.move();
	};
	
	Game.prototype.run = function(td){
	  Color.step();
	  this.move();
	  this.render();
	  window.requestAnimationFrame(td => this.run(td));
	};
	
	module.exports = Game;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	const Color = __webpack_require__(3);
	const Listener = __webpack_require__(4);
	
	function Player(scapes){
	  this.scapes = scapes;
	  this.state = 0;
	
	  this.maxSpeed = 5;
	  this.speed = 0;
	
	  this.radius = 20;
	  this.angle = 0;
	  this.x = window.innerWidth / 2;
	  this.y = 200;
	
	  this.grounded = false;
	  this.fallSpeed = -10;
	  this.fallTime = 0;
	  this.canJump = false;
	  this.jumping = false;
	}
	
	Player.prototype.checkInput = function () {
	  const drag = this.scape().speed;
	  const max = this.maxSpeed; // should be determined by slope, yes?
	                             // cant' just set, though, gotta decrement
	  const delta = (this.grounded ? .8 : .4);
	  // allow higher/lower max when on slant!
	
	  if(Listener.pressed(37)) {
	    this.speed -= delta;
	    if(this.speed < drag - max) this.speed = drag - max;
	  } else if(Listener.pressed(39)){
	    this.speed += delta;
	    if(this.speed > max) this.speed = max;
	  } else {
	    if(true){}
	  }
	
	  // may want a jump toggle on key release
	  if(Listener.pressed(38) || Listener.pressed(68)){
	    if(this.canJump){
	      this.jump();
	    }
	  } else if(Listener.pressed(40) || Listener.pressed(70)){
	    if(this.canJump){
	      this.jump();
	      this.state ^= 1;
	    }
	  } else {
	    this.jumping = false;
	    if(this.grounded) this.canJump = true;
	  }
	};
	
	Player.prototype.scape = function () {
	  return this.scapes[this.state];
	};
	
	Player.prototype.jump = function () {
	  this.grounded = false;
	  this.fallSpeed = -8 - .5 * (this.scape().speed - this.speed) * this.massSlope();
	  // should this also be impacted by the direction the jump point is going?
	  this.jumping = true;
	  this.canJump = false;
	};
	
	Player.prototype.turn = function () {
	  this.angle += 0.05 * (this.speed - this.scape().speed);
	};
	
	Player.prototype.move = function () {
	  this.checkInput();
	  this.turn();
	  const drag = this.scape().speed;
	
	  if(this.grounded){
	    if(this.speed > drag){
	      this.speed -= .2;
	      if(this.speed < drag) this.speed = drag;
	    } else if (this.speed < drag){
	      this.speed += .2;
	      if(this.speed > drag) this.speed = drag;
	    }
	    this.speed += .6 * this.massSlope();
	  }
	  const massY = this.massY();
	  if(!this.grounded){
	    this.canJump = false;
	    this.fall(massY);
	  } else {
	
	    // need to track current mass?
	    // see if we fell off of it?
	    if(massY === 0 || massY > this.y + 5 + this.massSlope() * this.speed){
	      this.grounded = false;
	    } else {
	      this.y = massY;
	    }
	  }
	
	  this.x += this.speed;
	
	  // const scape()Data = this.waveData();
	  // if(!this.grounded){
	  //   this.fall(waveData);
	  // }
	};
	
	Player.prototype.fall = function (massY) {
	  const delta = (this.jumping ? .02 : .05)
	  /// TODO: this should not jump like so, but decrement if not held.
	
	  this.fallTime += delta;
	  this.fallSpeed += this.fallTime;
	  this.y += this.fallSpeed;
	
	  const dif = massY - this.y
	  if(dif < 0 && Math.abs(dif) < this.fallSpeed * 2){
	    this.y = massY;
	    this.grounded = true;
	    this.fallSpeed = 0;
	    this.fallTime = 0;
	  }
	};
	
	Player.prototype.mass = function () {
	  let closestMass = null;
	  this.scape().masses.forEach( mass => {
	    if(mass.left.x < this.x && mass.right.x > this.x){
	      const y = mass.y(this.x);
	
	      // TODO: turn the "5" into a sensible number
	      //       prevents slipping through when mass shifts y
	      if(y + 10 >= this.y && (!closestMass || y < closestMass.y(this.x))){
	        closestMass = mass;
	      }
	    }
	  });
	  return closestMass;
	};
	
	Player.prototype.massY = function () {
	  const mass = this.mass();
	  return (mass ? mass.y(this.x) : 0);
	};
	
	Player.prototype.massSlope = function () {
	  const mass = this.mass();
	  return (mass ? mass.slope() : 0);
	};
	
	Player.prototype.render = function (ctx) {
	  const speedRatio = Math.abs(this.speed) / this.maxSpeed;
	  const grow = (1 + speedRatio * .15);
	  const shrink = (1 - speedRatio * .15);
	
	  ctx.fillStyle = Color.player();
	  // ctx.fillStyle = Color.mass();
	  ctx.beginPath();
	  ctx.ellipse(
	    this.x,
	    this.y - this.radius * shrink,
	    this.radius * grow,
	    this.radius * shrink,
	    0, 0 + this.angle,
	    Math.PI + this.angle);
	  ctx.fill();
	
	  ctx.beginPath();
	  // ctx.fillStyle = "white";
	  ctx.fillStyle = Color.mass(this.scape().dif);
	  ctx.ellipse(
	    this.x,
	    this.y - this.radius * shrink,
	    this.radius * grow,
	    this.radius * shrink,
	    0, Math.PI + this.angle,
	    Math.PI * 2 + this.angle);
	  ctx.fill();
	};
	
	
	module.exports = Player;


/***/ },
/* 3 */
/***/ function(module, exports) {

	function Color(){
	  this.lIncreasing = true;
	
	  this.h = Math.random() * 360;
	  this.s = 100;
	  this.l = 40;
	}
	
	Color.prototype.step = function(){
	  this.h >= 360 ? this.h = 0 : this.h += .5;
	
	  // if(this.lIncreasing){
	  //   if(this.l >= 10){
	  //     this.lIncreasing = false;
	  //     this.l -= .05;
	  //   } else this.l += .05;
	  // } else {
	  //   if(this.l <= 0){
	  //     this.lIncreasing = true;
	  //     this.l += .05;
	  //   } else this.l -= .05;
	  // }
	
	  // lightness could depend on how well we're doing
	};
	
	Color.prototype.main = function () {
	  const hsla = `hsla(${this.h}, ${this.s}%, ${0}%, 1)`;
	  return hsla;
	};
	
	Color.prototype.mass = function (dif) {
	  const hsla = `hsla(${this.h + 135 + dif}, ${this.s}%, ${this.l}%, 1)`;
	  return hsla;
	};
	
	Color.prototype.player = function () {
	  const hsla = `hsla(${this.h}, ${this.s}%, ${this.l}%, 1)`;
	  return hsla;
	};
	
	module.exports = new Color;


/***/ },
/* 4 */
/***/ function(module, exports) {

	const _viableKeys = [37, 38, 39, 40, 68, 70];
	
	function Listener(){
	  this.keys = {};
	
	  document.addEventListener("keydown", e => this._keyDown(e));
	  document.addEventListener("keyup", e => this._keyUp(e));
	}
	
	Listener.prototype._keyDown = function (e) {
	  const code = e.keyCode;
	  console.log(code);
	  if(_viableKeys.includes(code)){
	    e.preventDefault();
	    this.keys[e.keyCode] = true;
	  }
	};
	
	Listener.prototype._keyUp = function (e) {
	  const code = e.keyCode;
	  if(_viableKeys.includes(code)){
	    e.preventDefault();
	    delete this.keys[code];
	  }
	};
	
	Listener.prototype.pressed = function (key) {
	  return this.keys[key];
	};
	
	module.exports = new Listener;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	const Color = __webpack_require__(3);
	
	function Canvas(){
	  this.self = document.getElementById("canvas")
	
	  this.self.width = window.innerWidth;
	  this.self.height = window.innerHeight;
	
	  this.width = this.self.width;
	  this.height = this.self.height;
	  this.ctx = this.self.getContext("2d");
	
	
	  this.ctx.globalAlpha = 0.7;
	}
	
	Canvas.prototype.render = function () {
	  this.self.style.background = Color.main();
	  this.ctx.clearRect(0, 0, this.width, this.height);
	};
	
	
	module.exports = Canvas;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	const Mass = __webpack_require__(7);
	const Color = __webpack_require__(3);
	
	function Scape(canvas, level, speed) {
	  this.dif = level * 60;
	  this.canvas = canvas;
	  this.spacing = 200;
	
	  this.speed = speed; // -3 is good with slow music!
	  this.masses = Mass.generateMasses(
	    canvas.width,
	    canvas.height,
	    level,
	    this.spacing
	  );
	}
	
	Scape.prototype.spread = function () {
	  return Math.random() * 600 - 600;
	};
	
	Scape.prototype.move = function () {
	  this.masses.forEach( mass => {
	    mass.move(this.speed);
	  });
	  this.keepMassesInBounds();
	};
	
	Scape.prototype.render = function() {
	  const ctx = this.canvas.ctx;
	  ctx.save();
	  ctx.fillStyle = Color.mass(this.dif);
	
	  this.masses.forEach( mass => {
	    mass.render(ctx);
	  });
	
	  ctx.restore();
	};
	
	Scape.prototype.keepMassesInBounds = function(){
	  const masses = this.masses;
	  const spacing = this.spacing;
	
	  if(masses[0].bottom.x < (0 - spacing * 2)){
	    const mass = new Mass(
	      masses[masses.length-1].bottom.x + spacing + (Math.random() * 120 - 60),
	      this.canvas.height / 2 + this.spread()
	    );
	    masses.push(mass);
	    masses.shift();
	  }
	
	  if(masses[masses.length-1].bottom.x > (this.canvas.width + spacing * 2)){
	    const mass = new Mass(
	      masses[0].bottom.x - spacing - (Math.random() * 120 - 60),
	      this.canvas.height / 2 + this.spread()
	    );
	    masses.unshift(mass);
	    masses.pop();
	  }
	};
	
	module.exports = Scape;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	const Color = __webpack_require__(3);
	const Point = __webpack_require__(8);
	
	function Mass(x, y){
	  const rand1 = Math.random() * 180;
	  const rand2 = Math.random() * 180;
	
	  const x1 = x + (Math.random() * 100 + 50);
	  const y1 = y + rand1;
	  const x2 = x - (Math.random() * 100 + 50);
	  const y2 = y + rand2;
	  const x3 = x;
	  const y3 = y + (rand1 + rand2) / 2 + Math.random() * 75 + 75;
	  const speed = 0.0175 + Math.random()*0.0275;
	
	  this.right = new Point(x1, y1, speed);
	  this.left = new Point(x2, y2, speed);
	  this.bottom = new Point(x3, y3, speed, true);
	}
	
	Mass.prototype.render = function (ctx) {
	  ctx.beginPath();
	  ctx.moveTo(this.right.x, this.right.y);
	  ctx.lineTo(this.left.x, this.left.y);
	  ctx.lineTo(this.bottom.x, this.bottom.y);
	  ctx.fill();
	};
	
	Mass.prototype.move = function (speed) {
	  this.right.move(speed);
	  this.left.move(speed);
	  this.bottom.move(speed);
	};
	
	Mass.generateMasses = function(width, height, level, spacing){
	  const yCenter = height / 2;
	  const masses = [];
	
	  for (let x = -(spacing * 2 + level * spacing / 2); x <= width + spacing * 2; x += spacing) {
	    const spread = Math.random() * 300 - 400;
	    const mass = new Mass(
	      x + (Math.random() * 120 - 60),
	      yCenter + spread
	    );
	    masses.push(mass);
	  }
	  return masses;
	};
	
	Mass.prototype.y = function (playerX) {
	  const total = Math.abs(this.right.x - this.left.x)
	  const left = Math.abs(playerX - this.left.x);
	  const right = Math.abs(playerX - this.right.x);
	
	  const leftWeight = right / total; // opposite on purpose
	  const rightWeight = left / total; // closer should mean bigger, not smaller
	
	  return (this.left.y * leftWeight + this.right.y * rightWeight);
	};
	
	Mass.prototype.slope = function () {
	  return (this.left.y - this.right.y) / (this.left.x - this.right.x);
	};
	
	module.exports = Mass;


/***/ },
/* 8 */
/***/ function(module, exports) {

	function Point(x, y, speed, pendulum){
	  this.x = x;
	  this.y = y;
	  this.oldY = y;
	  this.oldX = x;
	
	  this.pendulum = pendulum || false;
	  this.angle = Math.random() * 60;
	  this.speed = speed;
	  this.amplitude = Math.random() * 30;
	}
	
	Point.prototype.swing = function () {
	  this.x = this.oldX + Math.sin(this.angle) * this.amplitude / 2;
	};
	
	Point.prototype.move = function (speed) {
	  this.y = this.oldY + Math.sin(this.angle) * this.amplitude;
	  if(this.pendulum) this.swing();
	  this.x += speed;
	  this.oldX += speed;
	  this.angle += this.speed;
	  this.oldY += .4; //  lett's have this as a scape iVar and mass iVar
	                   //  change slightly every time we generate a mass
	};
	
	module.exports = Point;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map