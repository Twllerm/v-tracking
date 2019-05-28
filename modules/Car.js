

const _ = require('lodash');

const CONSTANTS = {
  width: 2,
};

class Car {
  constructor(canvas, ctx, y) {
    this.canvas = canvas;
    this.ctx = ctx;

    this.width = null;
    this.height = null;
    this.interval = null;

    this.y = y;
    this.x = 0;

    this.addBindings();
    this.addListeners();
    this.update();
    this.mount();
    this.makeDrawing();
  }

  mount() {
    this.draw();
  }

  addBindings() {

  }

  addListeners() {
    window.addEventListener('resize', this.update);
  }

  update() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  stopDrawing() {
    window.clearInterval(this.interval);
  }

  step(time) {
    this.x += time * 0.1;
    this.draw();
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, 20, 10);
    this.ctx.fill();
  }
}

module.exports = Car;
