import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { carCardHTML } from '../js/components/car-card-html.js';
import { isListed } from '../js/data/cars.js';

const car = (overrides = {}) => ({
  id: 'toyota-harrier-z-2021',
  make: 'Toyota',
  model: 'Harrier Z',
  year: 2021,
  origin: 'Japan',
  mileage: 34200,
  fuel: 'Hybrid',
  grade: '4.5',
  price: 4650000,
  images: [],
  status: 'available',
  ...overrides,
});

test('an available car shows name, formatted specs, price and a Reserve link', () => {
  const html = carCardHTML(car());
  assert.match(html, /<h3>Toyota Harrier Z<\/h3>/);
  assert.match(html, /34,200 km/);
  assert.match(html, /Hybrid/);
  assert.match(html, /Grade 4\.5/);
  assert.match(html, /KSh 4,650,000/);
  assert.match(html, /Japan &middot; 2021/);
  assert.match(html, /<a class="reserve" href="contact\.html">Reserve &rarr;<\/a>/);
  assert.match(html, /data-id="toyota-harrier-z-2021"/);
  assert.match(html, /data-origin="Japan"/);
  assert.doesNotMatch(html, /status-tag/);
});

test('cta="view" links to the inventory for available cars', () => {
  assert.match(carCardHTML(car(), { cta: 'view' }), /href="inventory\.html">View &rarr;/);
});

test('reserved and incoming cars get a tag and an Enquire link whatever cta is asked for', () => {
  for (const [status, label] of [
    ['reserved', 'Reserved'],
    ['incoming', 'Arriving soon'],
  ]) {
    const html = carCardHTML(car({ status }), { cta: 'view' });
    assert.match(html, new RegExp(`<span class="status-tag">${label}</span>`));
    assert.match(html, /href="contact\.html">Enquire &rarr;/);
    assert.doesNotMatch(html, /Reserve &rarr;|View &rarr;/);
  }
});

test('gradient ids follow the index so cards on one page never collide', () => {
  assert.match(carCardHTML(car(), { index: 0 }), /id="car-grad-0"[\s\S]*url\(#car-grad-0\)/);
  assert.match(carCardHTML(car(), { index: 7 }), /id="car-grad-7"[\s\S]*url\(#car-grad-7\)/);
});

test('data is escaped, so markup in a field cannot break out of the card', () => {
  const html = carCardHTML(
    car({ make: '<img src=x onerror=alert(1)>', model: 'M"odel', grade: '<b>' })
  );
  assert.doesNotMatch(html, /<img src=x/);
  assert.doesNotMatch(html, /<b>/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt; M&quot;odel/);
});

test('sold cars are not listed; every other status is', () => {
  assert.equal(isListed(car({ status: 'sold' })), false);
  for (const status of ['available', 'reserved', 'incoming']) {
    assert.equal(isListed(car({ status })), true, status);
  }
});

test('the real data has featured cars, so the home page is never empty', () => {
  const list = JSON.parse(readFileSync(new URL('../data/cars.json', import.meta.url), 'utf8'));
  const featured = list.filter((c) => c.featured && isListed(c));
  assert.equal(featured.length, 3);
});
