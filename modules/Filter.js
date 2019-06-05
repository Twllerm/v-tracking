const _ = require('lodash');
const m = require('mathjs');

const movingModels = {
  constVel: 'constVel',
};

const movingParamsSchema = {
  constVel: ['velocity'],
};

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function opp(object, other, callback) {
  return _.mapValues(object, (val, key) => callback(val, other[key]));
}

function normalize(arr) {
  const min = m.min(arr);
  const max = m.max(arr);


  return arr.map(x => (x - min) / (max - min));
}

function fScore(particleState, trueState, sigm = 1) {
  const mu = trueState;
  const a = 1 / m.sqrt((2 * Math.PI * sigm));

  const e = m.exp(-((trueState - particleState) ** 2) / sigm);

  return a * e;
}

function fullFScore(particleState, trueState, sigm = 1) {
  const result = opp(particleState, trueState, (a, b) => fScore(a, b, sigm));

  return _.values(result).reduce((acc, x) => acc * x, 1);
}

function followForce(aState, bStare) {
  const actionT = 10;
  const dangerT = 3;
  const xDiff = aState.x - bStare.x;
  const yDiff = aState.y - bStare.y;
  const diff = xDiff;

  if (Math.abs(yDiff) > 10) {
    return 0;
  }

  if (Math.abs(diff) < actionT) {
    return 0;
  }

  if (xDiff < 0) {
    return 0;
  }

  return -(dangerT - xDiff) / 100;
}

function IDM(aState, bState) {
  const yDiff = aState.y - bState.y;

  if (Math.abs(yDiff) > 35) {
    return 0;
  }


  const a = 0.01;
  const b = 0.005;
  const T = 0.3;
  const bet = 4;
  const s0 = 60;
  const v0 = 1.5;
  const dva = bState.velocity - aState.velocity;
  const va = aState.velocity;
  const v = bState.velocity;
  const s = bState.x - aState.x;

  const sh = s0 + va * T + ((va * dva) / (2 * Math.sqrt(a * b)));


  return a * ((1 - (v / v0) ** bet) - (sh / s) ** 2);
}

class CarModel {
  constructor(
    x = 0,
    y,
    movingModel = 'constVel',
    movingParams = {},
    isParticle = false,
  ) {
    this.y = y;
    this.movingParams = movingParams;
    this.movingModel = movingModel;
    this.velocity = movingParams.velocity;
    this.accel = movingParams.accel;
    this.x = x;
    this.x0 = x;
    this.id = Math.random();
    this.weight = 1;
    this.isParticle = isParticle;
    this.scene = [];
  }

  move(time, mess = 'kek') {
    this[this.movingModel](time);
    return this;
  }

  constVel(time) {
    this.x = (time * this.velocity) + this.x0;
  }

  updateScene(scene) {
    this.scene = scene;
  }


  accelF(time) {
    this.velocity += this.accel;
    this.constVel(time);
  }

  idm(time) {
    const directInFront = this.scene.map((car) => {
      if (Math.abs(car.state.y - this.state.y) > 10 || car.state.x - this.state.x < 0) {
        return Infinity;
      }
      return car.state.x - this.state.x;
    });

    const directIndex = directInFront.indexOf(Math.min(...directInFront));

    this.velocity += IDM(this.state, this.scene[directIndex].state);
    this.constVel(time);
  }

  get state() {
    return {
      x: this.x,
      y: this.y,
      ...this.movingParams,
    };
  }


  updateWeight(w) {
    this.weight = w;
  }
}

class SuperFilter {
  constructor(nParticles, zTrack, scene) {
    this.filters = [
      new ParticleFilter(nParticles / 3, zTrack, scene, 'constVel'),
      new ParticleFilter(nParticles / 3, zTrack, scene, 'accelF'),
      new ParticleFilter(nParticles / 3, zTrack, scene, 'idm'),
    ];

    this.weights = [1, 1, 1];
  }

  updateScene(scene) {
    this.filters.forEach(f => f.updateScene(scene));
  }

  update(time, zState) {
    this.filters.forEach(f => f.update(time, zState));

    if (!zState) {
      return;
    }

    const states = this.filters.map(f => f.state);

    this.weights = this.weights.map((w, i) => fullFScore(states[i], zState));
  }

  get state() {
    const stubState = _.mapValues(this.filters[0].state, () => []);

    const states = this.filters.map(f => f.state);

    const allStates = states.reduce(
      (acc, state) => opp(acc, state, (arr, val) => arr.concat([val])), stubState,
    );

    const avgState = _.mapValues(allStates,
      values => values.reduce((acc, val, index) => acc + (val * this.weights[index]), 0));

    return avgState;
  }

  get particlesState() {
    const particles = this.filters.reduce((acc, f) => acc.concat(...f.particlesState), []);

    return particles;
  }
}

class ParticleFilter {
  constructor(nParticles, zTrack, scene, model = null) {
    const [lastZ, previousZ] = _.reverse(zTrack);
    this.scene = scene;


    const badDisp = {
      x: 20, y: 20, velocity: 1, accel: 0.001,
    };

    const goodDisp = {
      x: 20, y: 20, velocity: 1, accel: 0.001,
    };

    const moviengModels = ['constVel', 'accelF', 'idm'];

    this.particles = _.range(200).map((n) => {
      const disp = n % 2 === 0 ? goodDisp : badDisp;
      const x = getRandomArbitrary(lastZ.x - disp.x, lastZ.x + disp.x);
      const y = getRandomArbitrary(lastZ.y - disp.y, lastZ.y + disp.y);
      const velocity = getRandomArbitrary(lastZ.velocity - disp.velocity, lastZ.velocity + disp.velocity);
      const accel = getRandomArbitrary(lastZ.accel - disp.accel, lastZ.accel + disp.accel);

      const {
        x: trash, y: trashh,
      } = lastZ;


      const car = new CarModel(x, y, model || moviengModels[n % 3], { velocity, accel }, true);
      car.updateScene(this.scene);

      return car;
    });
  }

  move(time) {
    this.particles = this.particles.map(model => model.move(time, 'pop'));
  }

  updateScene(scene) {
    this.particles.forEach(p => p.updateScene(scene));
  }


  resample(weights) {

  }

  update(time, zState, hideTime = 0) {
    this.move(time);


    if (!zState) {
      const disp = 5 * hideTime;
      const zDisp = _.mapValues(this.state, val => val + getRandomArbitrary(disp / 1000, -disp / 1000));
      const weights = this.particles.map(p => fullFScore(p.state, zDisp, disp));
      const sumWehigths = _.sum(weights);


      const normWeights = weights.map(w => w / sumWehigths);


      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].updateWeight(normWeights[i]);
      }

      return;
    }


    const weights = this.particles.map(p => fullFScore(p.state, zState, zState ? 5 : 30));
    const sumWehigths = _.sum(weights);
    const normWeights = weights.map(w => w / sumWehigths);
    // const diff = this.state.x - zState.x;

    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].updateWeight(normWeights[i]);
    }
  }

  get state() {
    const stubState = _.mapValues(this.particles[0].state, () => []);

    const allStates = this.particles.reduce(
      (acc, model) => opp(acc, model.state, (arr, val) => arr.concat([val])), stubState,
    );

    const weights = this.particles.map(p => p.weight);

    const avgState = _.mapValues(allStates,
      values => values.reduce((acc, val, index) => acc + (val * weights[index]), 0));


    return avgState;
  }

  get particlesState() {
    return this.particles.map(x => ({ ...x.state, weight: x.weight }));
  }
}


module.exports = {
  ParticleFilter,
  CarModel,
  getRandomArbitrary,
  SuperFilter,
};
