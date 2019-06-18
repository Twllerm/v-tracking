

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

    const addCar = this.addCar.bind(this);

    this.ctx._onClick((event) => {
      const elem = this.canvas;
      const elemLeft = elem.offsetLeft;
      const elemTop = elem.offsetTop;

      const x = event.pageX - elemLeft - 30;
      const y = event.pageY - elemTop;


      addCar(800 - y, null, x, 'constVel');
    });

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


  drawCars(nCars = 3) {
    this.cars = _.range(nCars).map(n => this.drawCar(null, n, (n % 4) * 40 + Math.random() * 15, n === 2 ? 'idm' : 'accelF', n === 2, n === 0));
    this.cars.forEach(car => car.updateScene(this.cars.filter(c => c.id !== car.id)));
  }

  addCar(...args) {
    const newCar = this.drawCar(...args);
    newCar.mount();
    this.cars.push(newCar);
    this.cars.forEach(car => car.updateScene(this.cars.filter(c => c.id !== car.id)));
  }

  drawCar(x, n = null, y, type = 'constVel', isObserver, useFilter) {
    const xs = [5, 30, 10];

    switch (type) {
      case 'constVel':
        return new Car(this.canvas, this.ctx, {
          x: x || xs[n],
          y,
          movingModel: type,
          movingParams: { velocity: getRandomArbitrary(0.5, 2), accel: getRandomArbitrary(0, 0.002) },
          isObserver,
          particles: useFilter ? 100 : 0,
        });
      case 'accelF':
        return new Car(this.canvas, this.ctx, {
          x: x || xs[n],
          y,
          movingModel: type,
          movingParams: { velocity: getRandomArbitrary(0.5, 2), accel: getRandomArbitrary(0, 0.002) },
          isObserver,
          particles: useFilter ? 100 : 0,
        });
      case 'idm':
        return new Car(this.canvas, this.ctx, {
          x: x || xs[n],
          y,
          movingModel: type,
          movingParams: { velocity: getRandomArbitrary(0.5, 2) },
          isObserver,
          particles: useFilter ? 100 : 0,
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
