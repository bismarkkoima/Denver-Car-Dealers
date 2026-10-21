// Run with `npm run validate:data`. Exits 1 if data/cars.json has any problem,
// so a bad edit fails CI instead of silently dropping a car from the site.
import { readFileSync } from 'node:fs';
import { validateCars, describeProblems } from '../js/data/schema.js';

const file = new URL('../data/cars.json', import.meta.url);

let list;
try {
  list = JSON.parse(readFileSync(file, 'utf8'));
} catch (err) {
  console.error(`data/cars.json is not valid JSON: ${err.message}`);
  process.exit(1);
}

const { cars, problems } = validateCars(list);

if (problems.length) {
  console.error(`data/cars.json has ${problems.length} invalid record(s):\n`);
  console.error(describeProblems(problems));
  process.exit(1);
}

const listed = cars.filter((c) => c.status !== 'sold').length;
console.log(
  `data/cars.json OK: ${cars.length} cars (${listed} listed, ${cars.length - listed} sold)`
);
