// Route curves for the world map. Pure maths, so it can be tested in Node.
// Points are percentages (0-100) of the map box; the SVG uses the same
// 0-100 coordinate space, so a node and the end of its route always line up.

const fix = (n) => Number(n.toFixed(2));

// A quadratic curve from `from` to `to`, bowed sideways by `bend` times the
// distance between them. The bow always points up the screen, so routes read
// like flight paths rather than wobbling in random directions.
export function routePath(from, to, bend = 0.18) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return `M ${from.x} ${from.y}`;

  let nx = -dy / length;
  let ny = dx / length;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }

  const cx = fix((from.x + to.x) / 2 + nx * length * bend);
  const cy = fix((from.y + to.y) / 2 + ny * length * bend);
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}
