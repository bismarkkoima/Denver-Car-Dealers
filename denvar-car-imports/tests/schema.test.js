import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateCar, validateCars, describeProblems } from '../js/data/schema.js';

const good = () => ({
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
});

test('a complete record is valid', () => {
  assert.deepEqual(validateCar(good()), []);
});

test('featured is optional but must be a boolean', () => {
  assert.deepEqual(validateCar({ ...good(), featured: true }), []);
  assert.deepEqual(validateCar({ ...good(), featured: 'yes' }), [
    'featured: must be true or false',
  ]);
});

test('every required field is reported when missing', () => {
  const errors = validateCar({});
  for (const field of [
    'id',
    'make',
    'model',
    'year',
    'origin',
    'mileage',
    'fuel',
    'grade',
    'price',
    'images',
    'status',
  ]) {
    assert.ok(errors.includes(`${field}: is required`), `expected "${field}" to be required`);
  }
  assert.ok(!errors.some((e) => e.startsWith('featured')));
});

test('unknown fields are rejected (catches typos like "milage")', () => {
  assert.deepEqual(validateCar({ ...good(), milage: 5 }), ['milage: is not a known field']);
});

test('non-objects are rejected', () => {
  for (const value of [null, 5, 'car', [], undefined]) {
    assert.deepEqual(validateCar(value), ['must be an object']);
  }
});

const rejects = [
  ['id', 'Toyota Harrier', 'id: must be lowercase letters, numbers and single hyphens'],
  ['id', 'toyota--harrier', 'id: must be lowercase letters, numbers and single hyphens'],
  ['make', '  ', 'make: must be non-empty text'],
  ['year', 1989, 'year: must be a whole number from 1990 to 2030'],
  ['year', 2031, 'year: must be a whole number from 1990 to 2030'],
  ['year', 2021.5, 'year: must be a whole number from 1990 to 2030'],
  ['origin', 'Germany', 'origin: must be one of Japan, United Kingdom, UAE'],
  ['mileage', -1, 'mileage: must be a whole number of km, 0 or more'],
  ['mileage', '28,400', 'mileage: must be a whole number of km, 0 or more'],
  ['fuel', 'Steam', 'fuel: must be one of Petrol, Diesel, Hybrid, Electric'],
  ['grade', '', 'grade: must be non-empty text'],
  ['price', 0, 'price: must be a whole number of KSh greater than 0'],
  ['price', '9,200,000', 'price: must be a whole number of KSh greater than 0'],
  ['images', 'a.jpg', 'images: must be a list of image paths (can be empty)'],
  ['images', ['a.jpg', 3], 'images: must be a list of image paths (can be empty)'],
  ['status', 'maybe', 'status: must be one of available, reserved, incoming, sold'],
];

for (const [field, value, message] of rejects) {
  test(`rejects ${field} = ${JSON.stringify(value)}`, () => {
    assert.deepEqual(validateCar({ ...good(), [field]: value }, { maxYear: 2030 }), [message]);
  });
}

test('accepts boundary values', () => {
  const edge = {
    ...good(),
    year: 1990,
    mileage: 0,
    price: 1,
    images: ['assets/a.jpg'],
    status: 'sold',
  };
  assert.deepEqual(validateCar(edge), []);
});

test('validateCars separates good and bad records and reports their position', () => {
  const list = [good(), { ...good(), id: 'second', price: -5 }, { ...good(), id: 'third' }];
  const { cars, problems } = validateCars(list);
  assert.deepEqual(
    cars.map((c) => c.id),
    ['toyota-harrier-z-2021', 'third']
  );
  assert.equal(problems.length, 1);
  assert.equal(problems[0].index, 1);
  assert.equal(problems[0].id, 'second');
});

test('duplicate ids are flagged on the later record', () => {
  const { cars, problems } = validateCars([good(), good()]);
  assert.equal(cars.length, 1);
  assert.equal(problems[0].index, 1);
  assert.match(problems[0].errors[0], /already used by an earlier car/);
});

test('a top-level value that is not a list is reported', () => {
  const { cars, problems } = validateCars({ cars: [] });
  assert.deepEqual(cars, []);
  assert.deepEqual(problems[0].errors, ['data must be a list of cars']);
});

test('describeProblems names the car and each error', () => {
  const { problems } = validateCars([{ ...good(), price: -5 }]);
  const text = describeProblems(problems);
  assert.match(text, /car #1 \(toyota-harrier-z-2021\)/);
  assert.match(text, /- price: must be a whole number/);
});

test('the real data/cars.json passes the schema', () => {
  const list = JSON.parse(readFileSync(new URL('../data/cars.json', import.meta.url), 'utf8'));
  const { cars, problems } = validateCars(list);
  assert.deepEqual(problems, []);
  assert.equal(cars.length, 18);
});
