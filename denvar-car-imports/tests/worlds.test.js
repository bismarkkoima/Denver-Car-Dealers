import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KIND_LABELS, ROUTES, WORLDS, worldById } from '../js/worlds.js';
import { ORIGINS } from '../js/data/schema.js';

test('there are five worlds with unique ids', () => {
  assert.equal(WORLDS.length, 5);
  assert.equal(new Set(WORLDS.map((w) => w.id)).size, 5);
});

test('every world has the text and fields the map needs', () => {
  for (const w of WORLDS) {
    for (const field of ['id', 'name', 'short', 'blurb']) {
      assert.ok(typeof w[field] === 'string' && w[field].trim(), `${w.id}.${field}`);
    }
    assert.ok(KIND_LABELS[w.kind], `${w.id} has a known kind`);
    assert.ok(Array.isArray(w.facts), `${w.id}.facts`);
    assert.ok(w.enter.href && w.enter.label, `${w.id}.enter`);
  }
});

test('nodes sit inside the map with room for their labels, and never on top of each other', () => {
  for (const { id, pos } of WORLDS) {
    assert.ok(pos.x >= 10 && pos.x <= 90, `${id} x=${pos.x}`);
    assert.ok(pos.y >= 10 && pos.y <= 90, `${id} y=${pos.y}`);
  }
  for (let i = 0; i < WORLDS.length; i++) {
    for (let j = i + 1; j < WORLDS.length; j++) {
      const a = WORLDS[i].pos;
      const b = WORLDS[j].pos;
      assert.ok(
        Math.hypot(a.x - b.x, a.y - b.y) >= 20,
        `${WORLDS[i].id} and ${WORLDS[j].id} are too close`
      );
    }
  }
});

test('origin worlds cover every origin in the data schema, exactly once', () => {
  const fromWorlds = WORLDS.filter((w) => w.kind === 'origin').map((w) => w.origin);
  assert.deepEqual([...fromWorlds].sort(), [...ORIGINS].sort());
});

test('only origin worlds carry an origin', () => {
  for (const w of WORLDS) assert.equal('origin' in w, w.kind === 'origin', w.id);
});

test('origin worlds enter the inventory filtered to their own origin', () => {
  for (const w of WORLDS.filter((x) => x.kind === 'origin')) {
    const url = new URL(w.enter.href, 'http://localhost/');
    assert.equal(url.pathname, '/inventory.html');
    assert.equal(url.searchParams.get('origin'), w.origin);
  }
});

test('routes connect real worlds, with no duplicates or self-loops', () => {
  const seen = new Set();
  for (const [from, to] of ROUTES) {
    assert.ok(worldById(from), `unknown route start ${from}`);
    assert.ok(worldById(to), `unknown route end ${to}`);
    assert.notEqual(from, to);
    assert.ok(!seen.has(`${from}>${to}`), `duplicate route ${from}>${to}`);
    seen.add(`${from}>${to}`);
  }
});

test('the journey is connected: every origin reaches the port, and the port reaches the showroom', () => {
  const next = (id) => ROUTES.filter(([from]) => from === id).map(([, to]) => to);
  for (const w of WORLDS.filter((x) => x.kind === 'origin')) {
    assert.deepEqual(next(w.id), ['mombasa'], `${w.id} -> port`);
  }
  assert.deepEqual(next('mombasa'), ['showroom']);
  assert.deepEqual(next('showroom'), []);
});

test('worldById finds a world and returns undefined for an unknown id', () => {
  assert.equal(worldById('mombasa').name, 'Port of Mombasa');
  assert.equal(worldById('narnia'), undefined);
});
