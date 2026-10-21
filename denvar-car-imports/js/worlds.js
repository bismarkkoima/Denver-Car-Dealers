import { CONTACT } from './site.js';

// The "multiverse": every car follows one journey, and each stop on it is a
// world. Three auction markets feed the Port of Mombasa, which feeds the
// Nairobi showroom. The hub page (worlds.html) draws these as a constellation.
//
//   pos     where the node sits on the map, as a percentage (0-100) of its box
//   short   label used on narrow screens, where the full name will not fit
//   origin  (origin worlds only) must match an origin in js/data/schema.js
//   facts   static lines for the detail panel; origin worlds also get live
//           stock numbers added by <world-map>
//   enter   where "Enter world" goes until the worlds get pages of their own

export const KIND_LABELS = {
  origin: 'Auction market',
  port: 'Port',
  showroom: 'Showroom',
};

export const WORLDS = [
  {
    id: 'japan',
    kind: 'origin',
    origin: 'Japan',
    name: 'Japan',
    short: 'Japan',
    pos: { x: 20, y: 20 },
    blurb:
      'Most of our stock starts at Japanese auctions, where every car is graded and comes with an auction sheet. Hybrids and compact SUVs are the strongest range.',
    facts: [],
    enter: { href: 'inventory.html?origin=Japan', label: 'Browse Japan stock' },
  },
  {
    id: 'uk',
    kind: 'origin',
    origin: 'United Kingdom',
    name: 'United Kingdom',
    short: 'UK',
    pos: { x: 14, y: 52 },
    blurb:
      'Right-hand-drive premium SUVs and saloons, checked before they ship. A smaller range than Japan, in a higher price band.',
    facts: [],
    enter: { href: 'inventory.html?origin=United%20Kingdom', label: 'Browse UK stock' },
  },
  {
    id: 'uae',
    kind: 'origin',
    origin: 'UAE',
    name: 'UAE',
    short: 'UAE',
    pos: { x: 24, y: 82 },
    blurb:
      'Large SUVs and premium crossovers from the Gulf. The sea route to Mombasa is shorter than from Japan or the UK.',
    facts: [],
    enter: { href: 'inventory.html?origin=UAE', label: 'Browse UAE stock' },
  },
  {
    id: 'mombasa',
    kind: 'port',
    name: 'Port of Mombasa',
    short: 'Mombasa',
    pos: { x: 56, y: 50 },
    blurb:
      'Every container lands here. We handle KRA duty, the KEBS inspection and bond release ourselves, then move your car to Nairobi.',
    facts: [
      'Duty, inspection and bond release handled by us',
      '18 days on average from port to Nairobi',
    ],
    enter: { href: 'index.html#process', label: 'See how clearing works' },
  },
  {
    id: 'showroom',
    kind: 'showroom',
    name: 'Nairobi showroom',
    short: 'Showroom',
    pos: { x: 78, y: 24 },
    blurb:
      "Collect your car here once it's registered with NTSA, or have it delivered. Walk-ins are welcome during opening hours.",
    facts: [CONTACT.showroom, CONTACT.hours],
    enter: { href: 'contact.html', label: 'Plan a visit' },
  },
];

// Routes run from one world to the next, in the direction cars travel.
export const ROUTES = [
  ['japan', 'mombasa'],
  ['uk', 'mombasa'],
  ['uae', 'mombasa'],
  ['mombasa', 'showroom'],
];

export const worldById = (id) => WORLDS.find((w) => w.id === id);
