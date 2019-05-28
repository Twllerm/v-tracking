

const _ = require('lodash');
const Module = require('./Module');
const Car = require('./Car');

const CONSTANTS = {
  width: 2,
};

class Road extends Module {
  constructor(canvas, ctx, nLines = 2, nCars = 4) {
    super(canvas, ctx);

    this.nLines = nLines;
    this.nCars = nCars;
  }

  mount() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.drawLanes();
    this.drawCars();

    this.interval = this.simulation(this.update);
  }


  update(time) {
    this.ctx.globalCompositeOperation = 'destination-over';
    this.ctx.clearRect(0, 0, this.width, this.height); // clear canvas
    this.ctx.save();

    this.drawLanes();

    this.drawCars(time);
  }

  drawLanes() {
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.height, CONSTANTS.width);
    this.ctx.fill();

    _.range(this.nLines).map(i => this.drawLane(i));

    this.ctx.beginPath();
    this.ctx.rect(0, this.nLines * 40, this.height, CONSTANTS.width);
    this.ctx.fill();
  }

  drawLane(pos) {
    this.ctx.beginPath();
    this.ctx.setLineDash([5]);
    this.ctx.rect(0, pos * 40, this.height, 0);
    this.ctx.stroke();
  }

  drawDottedLine(x) {
    const segments = this.width / 100;

    for (let i = 0; i <= segments; i += 1) {
      this.ctx.beginPath();
    }
  }

  drawCars(time) {
    this.cars = _.range(this.nCars).map(n => this.drawCar(n, time));
  }

  drawCar(nLine, x = 0) {
    this.ctx.beginPath();
    this.ctx.rect(x, nLine * 40 + 15, 20, 10);
    this.ctx.fill();
  }
}

module.exports = Road;
