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
    this.x = x;
    this.id = Math.random();
    this.weight = 1;
    this.isParticle = isParticle;
  }

  move(time, mess = 'kek') {
    this[this.movingModel](time);
    return this;
  }

  constVel(time) {
    this.x += time * this.movingParams.velocity;
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

class ParticleFilter {
  constructor(nParticles, zTrack) {
    const [lastZ, previousZ] = _.reverse(zTrack);
    // const disp = _.mapValues(lastZ, (value, key) => Math.sqrt((value - previousZ[key]) ** 2));
    const badDisp = { x: 30, y: 30, velocity: 0.001 };

    const goodDisp = { x: 5, y: 5, velocity: 0.001 };


    this.particles = _.range(nParticles).map((n) => {
      const disp = n % 2 === 0 ? goodDisp : badDisp;
      const x = getRandomArbitrary(lastZ.x - disp.x, lastZ.x + disp.x);
      const y = getRandomArbitrary(lastZ.y - disp.y, lastZ.y + disp.y);
      const velocity = getRandomArbitrary(lastZ.velocity - disp.velocity, lastZ.velocity + disp.velocity);

      const {
        x: trash, y: trashh, ...movingParams
      } = lastZ;

      return new CarModel(x, y, movingModels.constVel, { velocity }, true);
    });
  }

  move(time) {
    this.particles = this.particles.map(model => model.move(time, 'pop'));
  }

  update(time, zState) {
    this.move(time);

    const states = [];

    this.particles.forEach(p => states.push(p.state));

    const diffs = states.map(state => opp(state, zState, (a, b) => (a - b) ** 2));

    const norms = diffs.map(diff => _.sum(_.values(diff)));

    // const normalizedDiffs = normalize(norms);

    const sumDiffs = _.sum(norms);
    const weights = norms.map(d => d / sumDiffs);


    for (let i = 0; i < norms.length; i++) {
      this.particles[i].updateWeight(weights[i]);
    }


    this.particles = this.particles.filter(p => p.weight > 0.01);
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
};
