import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carName, formatKm, formatKsh } from '../js/format.js';
import { escapeHTML } from '../js/util.js';

test('formatKm groups thousands', () => {
  assert.equal(formatKm(28400), '28,400 km');
  assert.equal(formatKm(0), '0 km');
  assert.equal(formatKm(1234567), '1,234,567 km');
});

test('formatKsh prefixes the currency and groups thousands', () => {
  assert.equal(formatKsh(9200000), 'KSh 9,200,000');
  assert.equal(formatKsh(950), 'KSh 950');
});

test('carName joins make and model', () => {
  assert.equal(
    carName({ make: 'Land Rover', model: 'Discovery Sport' }),
    'Land Rover Discovery Sport'
  );
});

test('escapeHTML neutralizes markup characters', () => {
  assert.equal(
    escapeHTML(`<img src=x onerror="a('b')">&`),
    '&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;'
  );
  assert.equal(escapeHTML(2021), '2021');
});
