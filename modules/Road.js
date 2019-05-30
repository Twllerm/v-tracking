

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

  addBindings() {
    super.addBindings();
    this.drawCar = this.drawCar.bind(this);
    this.drawCars = this.drawCars.bind(this);
  }

  mount() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    window.scroll(0, window.innerHeight);

    this.drawLanes();
    this.drawCars();


    this.interval = this.simulation(this.update);
    // window.setInterval(() => {

    // }, 300);
  }


  update(time) {
    this.ctx.globalCompositeOperation = 'destination-over';
    this.ctx.clearRect(0, 0, this.width, this.height); // clear canvas
    this.ctx.save();

    this.drawLanes();

    if (!this.cars) {
      this.drawCars();
    }


    this.cars.forEach(car => car.update(time));

    const observer = this.cars.find(car => car.isObserver);
    window.scroll(0, window.innerHeight - observer.x);
  }

  drawLanes() {
    this.ctx.beginPath();
    this.ctx.fillStyle = '#000';
    this.ctx.rect(0, 0, this.width, CONSTANTS.width);
    this.ctx.fill();

    _.range(this.nLines).map(i => this.drawLane(i));

    this.ctx.beginPath();
    this.ctx.rect(0, this.nLines * 40, this.width, CONSTANTS.width);
    this.ctx.fill();
  }

  drawLane(pos) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#000';
    this.ctx.fillStyle = '#000';
    this.ctx.setLineDash([5]);
    this.ctx.rect(0, pos * 40, this.width, 0);
    this.ctx.stroke();
  }


  drawCars(nCars = 2) {
    this.cars = _.range(nCars).map(n => this.drawCar(n, 4, 'constVel', n === 1, n === 0));
    this.cars.forEach(car => car.updateScene(this.cars.filter(c => c.id !== car.id)));
  }

  drawCar(nLine, nLines = 4, type = 'constVel', isObserver, useFilter) {
    const y = (nLine % nLines) * 40 + Math.random() * 15;


    switch (type) {
      case 'constVel':
        return new Car(this.canvas, this.ctx, {
          x: Math.random() * 100,
          y,
          movingModel: type,
          movingParams: { velocity: getRandomArbitrary(0.001, 0.003) },
          isObserver,
          particles: useFilter ? 30 : 0,
        });
      default:
        return null;
    }
  }

  cameraFollow() {
    const observer = this.cars.find(car => car.isObserver);
    const { x, y } = observer;

    this.ctx.save();
    this.ctx.translate(x - this.width / 2, y - this.height / 2);
    this.ctx.restore();
  }
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}


module.exports = Road;
