const scenes = {
  1: {
    start: performance.now() / 1000,
    width: 0,
    height: 0,
    render (context) {
      const now = performance.now() / 1000 - this.start;

      const radius = Math.min(this.width, this.height) / 2;
      const cx = this.width / 2;
      const cy = this.height / 2;
      context.fillStyle = 'rgba(0, 0, 255, 0.1)';
      context.fillRect(0, 0, this.width, this.height);

      context.beginPath();
      for (let i = 0; i < Math.PI * 2; i += Math.PI * 2 / 3) {
        const i2 = i + now;
        if (i === 0) {
          context.moveTo(Math.cos(i2) * radius + cx, Math.sin(i2) * radius + cy);
        } else {
          context.lineTo(Math.cos(i2) * radius + cx, Math.sin(i2) * radius + cy);
        }
      }
      context.closePath();
      context.stroke();
    },
  },
  2: {
    start: performance.now() / 1000,
    width: 0,
    height: 0,
    render (context) {
      const now = performance.now() / 1000 - this.start;

      for (let i = 0; i < 10; i ++) {
        const radius = Math.min(this.width, this.height) * (Math.sin(now + i) + 1) / 2 * 0.1;
        const x = Math.cos((now * (3 + i) + i) / 7) * (this.width / 2 - radius * 2) + this.width / 2 + radius;
        const y = Math.sin((now * (2 + i) + i * 2) / 5) * (this.height / 2 - radius * 2) + this.height / 2 + radius;
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.stroke();
      }
    },
  },
};

const callbacks = {
  /** @type {OffscreenCanvas} */
  osc: undefined,
  /** @type {CanvasRenderingContext2D} */
  context: undefined,

  /**
   * @param {OffscreenCanvas} data
   */
  canvas (data) {
    this.osc = data;
    this.context = data.getContext('2d');
    console.log('OffscreenCanvas updated.', this.osc, this.context);
  },
  /**
   * @param {object} data
   * @param {string} data.scene Key of scene
   * @param {number} data.width Width of target canvas
   * @param {number} data.height Height of target canvas
   */
  resize (data) {
    scenes[data.scene].width = data.width;
    scenes[data.scene].height = data.height;
    console.log(`Canvas ${data.scene} resized: (${data.width}, ${data.height})`);
  },
};

self.addEventListener('message', e => {
  Object.entries(e.data).forEach(([key, value]) => {
    if (key in callbacks) {
      callbacks[key](value);
    }
  });
}, false);

let fps = 0;
let count = 0;
let sec = Math.floor(performance.now() / 1000);

const render = () => {
  const sec2 = Math.floor(performance.now() / 1000);
  if (sec === sec2) {
    count ++;
  } else {
    [fps, count, sec] = [count, 0, sec2];
    self.postMessage({
      reportFramerate: fps,
    });
  }

  Object.entries(scenes).forEach(([key, value]) => {
    if (callbacks.osc && value.width && value.height) {
      callbacks.osc.width = value.width;
      callbacks.osc.height = value.height;
      callbacks.context.clearRect(0, 0, value.width, value.height);
      value.render(callbacks.context);
      self.postMessage({
        rendered: {
          scene: key,
          bitmap: callbacks.osc.transferToImageBitmap(),
        },
      });
    }
  });

  requestAnimationFrame(render);
};

render();
