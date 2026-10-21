import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withTransition } from '../js/transition.js';

const matchMedia = (reduced) => () => ({ matches: reduced });

test('runs the update inside a view transition when supported', () => {
  const calls = [];
  const transition = { finished: Promise.resolve() };
  const env = {
    document: {
      startViewTransition(fn) {
        calls.push('start');
        fn();
        return transition;
      },
    },
    matchMedia: matchMedia(false),
  };
  const result = withTransition(() => calls.push('update'), env);
  assert.deepEqual(calls, ['start', 'update']);
  assert.equal(result, transition);
});

test('runs the update directly when view transitions are not supported', () => {
  let ran = 0;
  const result = withTransition(() => ran++, { document: {}, matchMedia: matchMedia(false) });
  assert.equal(ran, 1);
  assert.equal(result, null);
});

test('skips the transition when the visitor prefers reduced motion', () => {
  let started = false;
  let ran = 0;
  const env = {
    document: {
      startViewTransition() {
        started = true;
      },
    },
    matchMedia: matchMedia(true),
  };
  withTransition(() => ran++, env);
  assert.equal(started, false);
  assert.equal(ran, 1);
});

test('still runs the update when there is no document or matchMedia at all', () => {
  let ran = 0;
  withTransition(() => ran++, {});
  assert.equal(ran, 1);
});
