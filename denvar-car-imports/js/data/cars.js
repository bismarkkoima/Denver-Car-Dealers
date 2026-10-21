import raw from '../../data/cars.json' with { type: 'json' };
import { validateCars, describeProblems } from './schema.js';

let pending;

// Loads the validated stock once and shares the result. It is async on purpose:
// today the JSON is bundled with the page, and a later phase can swap this for
// a fetch from an API or CMS without touching any component.
//
// Records that fail validation are skipped and logged, so one typo in the data
// cannot blank the whole inventory. CI (`npm run validate:data`) rejects them.
export function loadCars() {
  pending ??= Promise.resolve().then(() => {
    const { cars, problems } = validateCars(raw);
    if (problems.length) {
      console.warn(
        `Skipped ${problems.length} invalid car record(s):\n${describeProblems(problems)}`
      );
    }
    return cars;
  });
  return pending;
}

// Cars that should appear on the site. Sold cars stay in the data for records
// but are not listed.
export const isListed = (car) => car.status !== 'sold';
