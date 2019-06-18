
const Module = require('./Module');
const { Wall, Point, getHitpoints } = require('./geometry');
const { CarModel, ParticleFilter, SuperFilter } = require('./Filter');
const Chart = require('chart.js');
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
    particles = 0,
  }) {
    super(canvas, ctx);
    this.model = new CarModel(x, y, movingModel, movingParams);
    this.scene = [];
    this.isObserver = isObserver;
    this.isVisible = true;
    this.zTrack = [];
    this.particles = particles;
    this.hideTime = 0;
    this.l1 = [];
    this.l2 = [];
    this.l3 = [];
    this.t = [];
    // const ctx_ = document.getElementById('myChart').getContext('2d');

    // const data = this.l1.map((l, i) => ({ x: this.t[i], y: l }));

    // const myChart = new Chart(ctx_, {
    //   type: 'bar',
    //   data: this.l1,
    //   options: {
    //     showLines: true, // disable for all datasets
    //   },
    // });

    // this.chart = myChart;

    const img = new Image();

    img.src = 'assets/car.svg';

    img.onload = () => {
      this.img = img;
    };
  }

  get x() {
    return this.model.x;
  }

  get y() {
    return this.model.y;
  }

  get id() {
    return this.model.id;
  }

  get state() {
    return this.model.state;
  }

  mount() {
    this.draw();
  }

  //   function addData(chart, label, data) {
  //     chart.data.labels.push(label);
  //     chart.data.datasets.forEach((dataset) => {
  //         dataset.data.push(data);
  //     });
  //     chart.update();
  // }

  drawCharts() {
    if (this.filter) {
      const ctx = document.getElementById('myChart').getContext('2d');

      // this.t.map(t => t);

      // const data = this.l1.map((l, i) => ({ x: this.t[i], y: l }));

      if (this.chart) {
        this.chart.data.datasets[0].data = this.l1.slice(this.l1.length - 100, this.l1.length - 1);
        this.chart.data.labels = this.t.slice(this.t.length - 100, this.t.length - 1);
        this.chart.update();
        return;
      }


      this.chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',


        // The data for our dataset
        data: {
          labels: this.t,
          datasets: [{
            label: 'L1',
            // backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            // data: this.l1,
            data: this.l1,
          },

          ],
        },

        // Configuration options go here
        options: {
          scales: {
            yAxes: [{
              stacked: true,
            }],
          },
        },
      });
    }
  }

  updateScene(scene) {
    this.scene = scene;
    this.model.updateScene(scene);

    if (this.filter) {
      this.filter.updateScene(scene);
    }
  }

  getL1Metrik() {
    console.log('adssa');
    const { x: xFilter, y: yFilter } = this.filter.state;
    const { x, y } = this.model;
    const res = Math.sqrt(((x - xFilter) ** 2) + ((y - yFilter) ** 2)) / 40;
    // console.log(res);
    this.l1.push(res);

    return res;
  }

  getL2Metrik() {
    const l1Metrik = this.getL1Metrik();
    const res = l1Metrik * this.zTrack.length;
    this.l2.push(res);
    return res;
  }

  getL3Metrik() {
    const res = this.getL1Metrik() / this.hideTime;
    this.l3.push(res);
    return res;
  }

  update(time) {
    this.t.push(time.toFixed(2));
    this.model.move(time);

    if (this.isVisible) {
      this.zTrack.push(this.model.state);
    } else {
      this.hideTime += 0.1;
    }

    if (this.filter) {
      this.filter.update(time, this.isVisible ? this.model.state : null, this.hideTime);
    }

    this.draw();

    if (this.filter) {
      const L1 = this.getL1Metrik();
      const L2 = this.getL2Metrik();
      const L3 = this.getL3Metrik();
      const TH = this.hideTime;


      // document.getElementById('L1').innerHTML = L1.toFixed(3);
      document.getElementById('Nz').innerHTML = this.zTrack.length;
      // document.getElementById('L3').innerHTML = L3.toFixed(3);
      // document.getElementById('TH').innerHTML = TH.toFixed(3);
    }
  }

  constVel(time) {
    this.x += time * this.movingParams.velocity;
  }

  setVisibility(isVisible) {
    if ((isVisible && !this.filter && this.particles && this.zTrack.length > 5)) {
      this.filter = new ParticleFilter(this.particles, this.zTrack, this.scene);
      // this.filter = new SuperFilter(this.particles, this.zTrack, this.scene);
    }


    this.isVisible = isVisible;
  }

  draw() {
    if (!this.model) {
      return;
    }

    if (this.img) {
	    this.ctx.save();

      if (!this.isVisible) {
        this.ctx.globalAlpha = 0.5;
      }

      this.ctx.drawImage(this.img, this.x, this.y);
      this.ctx.restore();
    }

    if (this.filter) {
      this.ctx.save();
      this.ctx.fillStyle = '#0000FF';
      // console.log(this.filter.state);
      this.ctx.rect(this.filter.state.x, this.filter.state.y, 40, 20);
      this.ctx.fill();
      this.ctx.restore();

      const partStates = this.filter.particlesState;

      partStates.forEach((p) => {
        this.ctx.save();
        this.ctx.fillStyle = '#0000FF';
        this.ctx.globalAlpha = p.weight / 2;
        // console.log(this.filter.state);
        this.ctx.rect(p.x, p.y, 40, 20);
        this.ctx.fill();
        this.ctx.restore();
      });

      this.drawCharts();
    }

    const width = 40;
    const height = 20;

    this.bounds = [
	    // left
      new Wall(new Point(this.x, this.y), new Point(this.x, this.y + height), this.id),
      // bottom
      new Wall(new Point(this.x, this.y + height), new Point(this.x + width, this.y + height), this.id),
      // right
      new Wall(new Point(this.x + width, this.y + height), new Point(this.x + width, this.y), this.id),
      // top
      new Wall(new Point(this.x, this.y), new Point(this.x + width, this.y), this.id),
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
  }

  observeScene() {
    const { width, height } = CONSTANTS;

    const allBounds = this.scene.reduce((acc, car) => acc.concat(car.bounds), []);

    const fromX = this.x + width / 2;
    const fromY = this.y + height / 2;

    const [hitpoints, hitIds] = getHitpoints(fromX, fromY, allBounds);

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


    this.scene.filter(car => !hitIds.includes(car.id)).forEach(car => car.setVisibility(false));
    this.scene.filter(car => hitIds.includes(car.id)).forEach(car => car.setVisibility(true));
  }
}


module.exports = Car;
