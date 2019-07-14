class Agent {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;

    this.addBindings();
    this.mount();
  }


  addBindings() {
    this.update = this.update.bind(this);
    this.mount = this.mount.bind(this);
    this.simulation = this.simulation.bind(this);
    this.stopDrawing = this.stopDrawing.bind(this);
  }

  update() {

  }

  mount() {

  }

  simulation(func, speed = 0.1) {
    this.time = 0.0;

    this.interval = window.setInterval(() => {
      func(this.time);
      this.time += speed;
    });

    return this.interval;
  }

  stopDrawing() {
    window.clearInterval(this.interval);
  }
}

module.exports = Agent;
