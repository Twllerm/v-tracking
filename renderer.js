// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const Lines = require('./modules/Lines');
const Road = require('./modules/Road');

class Renderer {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx._onClick = (func) => {
      this.canvas.addEventListener('click', func);
    };
    this.width = null;
    this.height = null;
    this.addBindings();
    this.addListeners();
    this.update();
    this.run();
  }

  addBindings() {
    this.update = this.update.bind(this);
  }

  addListeners() {
    window.addEventListener('resize', this.update);
  }

  update() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  run() {
    new Road(this.canvas, this.ctx, 4);
  }
}

new Renderer();
