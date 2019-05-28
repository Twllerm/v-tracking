// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const Lines = require('./modules/Lines');
const Road = require('./modules/Road');

class Renderer {
	constructor() {
        this.canvas = document.getElementById('canvas');
		this.ctx = this.canvas.getContext('2d');
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
        // new Lines(this.canvas, this.ctx);
        new Road(this.canvas, this.ctx, 4);
		// new Lines(this.canvas, this.ctx, false);
		// new Dots(this.canvas, this.ctx);
		// new Image(this.canvas, this.ctx, false, 'img/corgi.png');
		// new Image(this.canvas, this.ctx, false, 'img/zizek.png');
		// new CircleImage(this.canvas, this.ctx, 'img/corgi.png', 0, 0, 300, 50, 59);
		// new CircleImage(this.canvas, this.ctx, 'img/corgi.png', this.width, 0, 300, 50, 59);
		// new CircleImage(this.canvas, this.ctx, 'img/corgi.png', 0, this.height, 300, 50, 59);
		// new CircleImage(this.canvas, this.ctx, 'img/corgi.png', this.width, this.height, 300, 50, 59);
		// new CircleImage(this.canvas, this.ctx, 'img/tea.png', 260, 260, 300, 80, 80);
		// new CircleImage(this.canvas, this.ctx, 'img/tea.png', this.width - 260, 260, 300, 80, 80);
		// new CircleImage(this.canvas, this.ctx, 'img/tea.png', 260, this.height - 260, 300, 80, 80);
		// new CircleImage(this.canvas, this.ctx, 'img/tea.png', this.width - 260, this.height - 260, 300, 80, 80);
		// new CircleImage(this.canvas, this.ctx, 'img/corgi.png', this.width/2, this.height/2, 300, 100, 118);
		// new QuicksortImage(this.canvas, this.ctx, 'img/cat.png');
	}
}

new Renderer();