

const _ = require('lodash');
const Module = require('./Module');
const { Wall, Point, getHitpoints } = require('./geometry');
// const carAsset = require('../assets/car.svg');

const CONSTANTS = {
  width: 40,
  height: 20,
};

class Car extends Module {
  constructor(canvas, ctx, {
    x = 0,
    y,
    movingParams = {},
    movingModel = 'constVel',
    isObserver = false,
  }) {
    super(canvas, ctx);

    this.id = Math.random();

    this.y = y;
    this.movingParams = movingParams;
    this.movingModel = movingModel;
    this.x = x;
    this.scene = [];
    this.isObserver = isObserver;

    const img = new Image();

    img.src = 'assets/car.svg';

    img.onload = () => {
      this.img = img;
    };
  }


  mount() {
    this.draw();
  }

  updateScene(scene) {
    this.scene = scene;
  }

  update(time) {
    this[this.movingModel](time);
    this.draw();
  }

  constVel(time) {
    this.x += time * this.movingParams.velocity;
  }

  draw() {
    if (this.img) {
      this.ctx.drawImage(this.img, this.x, this.y);
    }

    const width = 40;
    const height = 20;

    this.bounds = [
	 // left
	  new Wall(new Point(this.x, this.y), new Point(this.x, this.y + height)),
	  // bottom
	  new Wall(new Point(this.x, this.y + height), new Point(this.x + width, this.y + height)),
	  // right
	  new Wall(new Point(this.x + width, this.y + height), new Point(this.x + width, this.y)),
	  // top
	  new Wall(new Point(this.x, this.y), new Point(this.x + width, this.y)),
    ];

    const fromX = this.x + width / 2;
    const fromY = this.y + height / 2;


    // Render all the walls
    this.ctx.beginPath();

    for (let i = 0; i < this.bounds.length; i++) {
      const wall = this.bounds[i];
      this.ctx.moveTo(wall.p1.x, wall.p1.y);
      this.ctx.lineTo(wall.p2.x, wall.p2.y);
    }
    this.ctx.stroke();

    this.ctx.restore();

    if (this.isObserver) {
      this.observeScene();
    }

    // this.ctx.beginPath();
    // this.ctx.rect(this.x, this.y, 40, 20);
    // this.ctx.fill();
  }

  observeScene() {
    const { width, height } = CONSTANTS;

    const allBounds = this.scene.reduce((acc, car) => acc.concat(car.bounds), []);

	  const fromX = this.x + width / 2;
	  const fromY = this.y + height / 2;

	  const hitpoints = getHitpoints(fromX, fromY, allBounds);

	  this.ctx.beginPath();
	  this.ctx.fillStyle = '#0000FF';
	  this.ctx.strokeStyle = '#FF0000';

	  for (let i = 0; i < hitpoints.length; i++) {
      const hitpoint = hitpoints[i];
      this.ctx.moveTo(fromX, fromY);
      this.ctx.lineTo(hitpoint.x, hitpoint.y);
      this.ctx.fillRect(hitpoint.x - 2.5, hitpoint.y - 2.5, 5, 5);
	  }

	  this.ctx.stroke();
	  this.ctx.restore();
  }
}


module.exports = Car;
