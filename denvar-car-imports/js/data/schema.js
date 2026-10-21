// Schema for data/cars.json, hand-written so the site needs no runtime dependency.
// Used by the loader in the browser and by `npm run validate:data` in CI.

export const ORIGINS = ['Japan', 'United Kingdom', 'UAE'];
export const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
export const STATUSES = ['available', 'reserved', 'incoming', 'sold'];

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const KNOWN_KEYS = new Set([
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
  'featured',
]);
const REQUIRED_KEYS = [...KNOWN_KEYS].filter((k) => k !== 'featured');

const isText = (v) => typeof v === 'string' && v.trim().length > 0;
const isInt = (v) => Number.isInteger(v);

// Returns a list of human-readable problems for one record (empty = valid).
export function validateCar(car, { maxYear = new Date().getFullYear() + 1 } = {}) {
  if (car === null || typeof car !== 'object' || Array.isArray(car)) {
    return ['must be an object'];
  }

  const errors = [];
  const bad = (field, message) => errors.push(`${field}: ${message}`);

  for (const key of REQUIRED_KEYS) {
    if (!(key in car)) bad(key, 'is required');
  }
  for (const key of Object.keys(car)) {
    if (!KNOWN_KEYS.has(key)) bad(key, 'is not a known field');
  }

  if ('id' in car && !(isText(car.id) && ID_PATTERN.test(car.id))) {
    bad('id', 'must be lowercase letters, numbers and single hyphens');
  }
  if ('make' in car && !isText(car.make)) bad('make', 'must be non-empty text');
  if ('model' in car && !isText(car.model)) bad('model', 'must be non-empty text');
  if ('year' in car && !(isInt(car.year) && car.year >= 1990 && car.year <= maxYear)) {
    bad('year', `must be a whole number from 1990 to ${maxYear}`);
  }
  if ('origin' in car && !ORIGINS.includes(car.origin)) {
    bad('origin', `must be one of ${ORIGINS.join(', ')}`);
  }
  if ('mileage' in car && !(isInt(car.mileage) && car.mileage >= 0)) {
    bad('mileage', 'must be a whole number of km, 0 or more');
  }
  if ('fuel' in car && !FUELS.includes(car.fuel)) {
    bad('fuel', `must be one of ${FUELS.join(', ')}`);
  }
  if ('grade' in car && !isText(car.grade)) bad('grade', 'must be non-empty text');
  if ('price' in car && !(isInt(car.price) && car.price > 0)) {
    bad('price', 'must be a whole number of KSh greater than 0');
  }
  if ('images' in car && !(Array.isArray(car.images) && car.images.every(isText))) {
    bad('images', 'must be a list of image paths (can be empty)');
  }
  if ('status' in car && !STATUSES.includes(car.status)) {
    bad('status', `must be one of ${STATUSES.join(', ')}`);
  }
  if ('featured' in car && typeof car.featured !== 'boolean') {
    bad('featured', 'must be true or false');
  }

  return errors;
}

// Validates a whole list. `problems` carries the record index and id so a bad
// row is easy to find; duplicate ids are reported on the later record.
export function validateCars(list, options) {
  if (!Array.isArray(list)) {
    return {
      cars: [],
      problems: [{ index: -1, id: null, errors: ['data must be a list of cars'] }],
    };
  }

  const cars = [];
  const problems = [];
  const seen = new Set();

  list.forEach((car, index) => {
    const errors = validateCar(car, options);
    const id = car && typeof car === 'object' ? (car.id ?? null) : null;
    if (id !== null && seen.has(id)) errors.push(`id: "${id}" is already used by an earlier car`);
    if (id !== null) seen.add(id);

    if (errors.length) problems.push({ index, id, errors });
    else cars.push(car);
  });

  return { cars, problems };
}

export function describeProblems(problems) {
  return problems
    .map((p) => {
      const where = p.index < 0 ? 'cars.json' : `car #${p.index + 1}${p.id ? ` (${p.id})` : ''}`;
      return `${where}\n${p.errors.map((e) => `  - ${e}`).join('\n')}`;
    })
    .join('\n');
}
