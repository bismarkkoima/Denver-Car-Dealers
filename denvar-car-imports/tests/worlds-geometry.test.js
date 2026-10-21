import { test } from 'node:test';
import assert from 'node:assert/strict';
import { routePath } from '../js/worlds-geometry.js';
import { ROUTES, worldById } from '../js/worlds.js';

const parse = (d) => {
  const m = d.match(/^M (\S+) (\S+) Q (\S+) (\S+) (\S+) (\S+)$/);
  assert.ok(m, `unexpected path: ${d}`);
  const [sx, sy, cx, cy, ex, ey] = m.slice(1).map(Number);
  return { start: { x: sx, y: sy }, control: { x: cx, y: cy }, end: { x: ex, y: ey } };
};

test('a route starts and ends exactly on its two nodes', () => {
  const { start, end } = parse(routePath({ x: 20, y: 20 }, { x: 56, y: 50 }));
  assert.deepEqual(start, { x: 20, y: 20 });
  assert.deepEqual(end, { x: 56, y: 50 });
});

test('the curve bows up the screen whichever way the route runs', () => {
  const pairs = [
    [
      { x: 10, y: 50 },
      { x: 60, y: 50 },
    ],
    [
      { x: 60, y: 50 },
      { x: 10, y: 50 },
    ],
    [
      { x: 20, y: 80 },
      { x: 56, y: 50 },
    ],
    [
      { x: 56, y: 50 },
      { x: 84, y: 24 },
    ],
  ];
  for (const [a, b] of pairs) {
    const { control } = parse(routePath(a, b));
    const midY = (a.y + b.y) / 2;
    assert.ok(control.y < midY, `control y ${control.y} should be above midpoint ${midY}`);
  }
});

test('bend scales the sideways offset, and 0 gives a straight line', () => {
  const a = { x: 10, y: 50 };
  const b = { x: 60, y: 50 };
  assert.equal(parse(routePath(a, b, 0)).control.y, 50);
  const small = 50 - parse(routePath(a, b, 0.1)).control.y;
  const large = 50 - parse(routePath(a, b, 0.2)).control.y;
  assert.ok(Math.abs(large - small * 2) < 0.01);
});

test('two nodes in the same place do not produce NaN', () => {
  assert.equal(routePath({ x: 5, y: 5 }, { x: 5, y: 5 }), 'M 5 5');
});

test('every real route stays inside the map', () => {
  for (const [from, to] of ROUTES) {
    const { control } = parse(routePath(worldById(from).pos, worldById(to).pos));
    assert.ok(control.x >= 0 && control.x <= 100, `${from}>${to} control x ${control.x}`);
    assert.ok(control.y >= 0 && control.y <= 100, `${from}>${to} control y ${control.y}`);
  }
});
