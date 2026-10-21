// Animated canvas backdrop: slow gold/green light streaks that stand in for a
// background video. Respects prefers-reduced-motion (draws a still frame).
export function initAmbient(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0;
  let h = 0;
  let streaks = [];

  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    const count = Math.max(14, Math.floor(w / 90));
    streaks = Array.from({ length: count }, () => ({
      y: Math.random() * h,
      x: Math.random() * w,
      len: 120 + Math.random() * 260,
      speed: 1.2 + Math.random() * 2.6,
      width: 0.6 + Math.random() * 1.6,
      hue: Math.random() > 0.5 ? '198,162,39' : '44,107,65',
    }));
  }

  function frame() {
    ctx.fillStyle = 'rgba(11,25,19,1)';
    ctx.fillRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(32,74,49,0.55)');
    grad.addColorStop(1, 'rgba(11,25,19,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (const s of streaks) {
      ctx.strokeStyle = `rgba(${s.hue},0.5)`;
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.len, s.y);
      ctx.stroke();
      if (!reduce) s.x += s.speed;
      if (s.x - s.len > w) s.x = -20;
    }

    if (!reduce) requestAnimationFrame(frame);
  }

  window.addEventListener('resize', () => {
    resize();
    seed();
    if (reduce) frame();
  });
  resize();
  seed();
  frame();
}
