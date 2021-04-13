const scenes = {
  1: {
    start: performance.now() / 1000,
    render ({ osc, context }) {
      const now = performance.now() / 1000 - this.start;

      const radius = Math.min(osc.width, osc.height) / 2;
      const cx = osc.width / 2;
      const cy = osc.height / 2;
      context.fillStyle = 'rgba(0, 0, 255, 0.1)';
      context.fillRect(0, 0, osc.width, osc.height);

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
    render ({ osc, context }) {
      const now = performance.now() / 1000 - this.start;

      for (let i = 0; i < 10; i ++) {
        const radius = Math.min(osc.width, osc.height) * (Math.sin(now + i) + 1) / 2 * 0.1;
        const x = Math.cos((now * (3 + i) + i) / 7) * (osc.width / 2 - radius * 2) + osc.width / 2 + radius;
        const y = Math.sin((now * (2 + i) + i * 2) / 5) * (osc.height / 2 - radius * 2) + osc.height / 2 + radius;
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
   * @param {number} data.width Width of target canvas
   * @param {number} data.height Height of target canvas
   * @param {string} data.scene Key of scene
   * @param {any} data.responseKey
   */
  render (data) {
    if (this.osc) {
      this.osc.width = data.width;
      this.osc.height = data.height;
      this.context.clearRect(0, 0, data.width, data.height);
      data.scene in scenes && scenes[data.scene].render(this);
    }
    self.postMessage({
      completed: data.responseKey,
      bitmap: this.osc.transferToImageBitmap(),
    });
  },
};

self.addEventListener('message', e => {
  Object.entries(e.data).forEach(([key, value]) => {
    if (key in callbacks) {
      callbacks[key](value);
    }
  });
}, false);
