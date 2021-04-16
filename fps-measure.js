(() => {
  /**
   * @typedef {object} FPSCounter
   * @property {number} current
   * @property {number} next
   * @property {number} now
  */

  /**
   * @type {Object<string, FPSCounter>}
   */
  const map = { };

  /**
   * @param {string} name
   */
  window.pushFrame = (name) => {
    const now = Math.floor(performance.now() / 1000);
    const obj = map[name] = (map[name] || { now, current: 0, next: 0 });
    if (now === obj.now) {
      obj.next ++;
    } else {
      [obj.current, obj.next, obj.now] = [obj.next, 0, now];
    }
    document.querySelectorAll(`[data-fps="${name}"]`).forEach(e => (e.textContent = obj.current));
  };

  const loop = () => {
    window.pushFrame('root');
    requestAnimationFrame(loop);
  }
  window.addEventListener('DOMContentLoaded', loop);
})();
