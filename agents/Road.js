

const _ = require('lodash');
const Agent = require('./Agent');
const Car = require('./Car');

const CONSTANTS = {
  borderWidth: 2,
  laneWidth: 40,
};

const roadScene = [
  {
    startX: 5,
    nLane: 0,
    movingModel: 'idm',
    virtualTracking: true,
  },
  {
    startX: 20,
    nLane: 1,
    movingModel: 'accelF',
  },
  {
    startX: 5,
    nLane: 2,
    movingModel: 'accelF',
    isObserver: true,
  },
];

class Road extends Agent {
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


      addCar(800 - y, x, 'constVel');
    });
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
    this.ctx.rect(0, 0, this.width, CONSTANTS.borderWidth);
    this.ctx.fill();

    _.range(this.nLines).map(i => this.drawLane(i));

    this.ctx.beginPath();
    this.ctx.rect(0, this.nLines * 40, this.width, CONSTANTS.borderWidth);
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

  resolveLanePosition(nLane) {
    return nLane * CONSTANTS.laneWidth + (Math.random() * 15);
  }

  syncAgentsContext() {
    this.cars.forEach(car => car.updateScene(this.cars.filter(c => c.id !== car.id)));
  }

  drawCars() {
    this.cars = roadScene
      .map(config => this.drawCar(
        config.startX,
        this.resolveLanePosition(config.nLane),
        config.movingModel,
        config.isObserver,
        config.virtualTracking,
      ));

    this.syncAgentsContext();
  }

  addCar(...args) {
    const newCar = this.drawCar(...args);
    newCar.mount();
    this.cars.push(newCar);
    this.cars.forEach(car => car.updateScene(this.cars.filter(c => c.id !== car.id)));
  }

  drawCar(x, y, movingModel, isObserver, virtualTracking) {
    return new Car(this.canvas, this.ctx, {
      x,
      y,
      movingModel,
      movingParams: { velocity: getRandomArbitrary(0.5, 2), accel: getRandomArbitrary(0, 0.002) },
      isObserver,
      particles: virtualTracking ? 100 : 0,
    });
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
