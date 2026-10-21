# Denvar Car Imports — site source

Plain HTML, CSS and vanilla JS (ES modules), built with Vite. The output is a
static folder you can host anywhere.

```
npm install        # once
npm run dev        # local dev server with hot reload
npm run build      # production build into dist/
npm run preview    # serve the built dist/ locally
npm run lint       # ESLint
npm run format     # Prettier (use format:check to only verify)
npm run validate:data  # check data/cars.json against the schema
npm test           # unit tests (schema, formatting, card template, worlds, transitions)
npm run check      # everything above plus a build; run before pushing
```

Requires Node 22 or newer. The build uses a relative base (`./`), so `dist/`
works on GitHub Pages, Netlify, or inside a subfolder.

## Structure

```
denvar-car-imports/
├── index.html        Home
├── worlds.html        The multiverse hub: constellation map of the car's journey
├── inventory.html     Inventory (car grid + origin filter)
├── about.html          About / company story
├── contact.html         Contact form + info
├── styleguide.html       Living style guide rendered from the tokens
├── ROADMAP.md             20-phase plan for the multiverse redesign
├── data/
│   └── cars.json          The stock: one record per car (see schema below)
├── css/
│   ├── tokens.css         Design tokens: colors, glass, type, spacing, radii, motion
│   ├── styles.css         Layout, components and breakpoints (reads tokens.css)
│   └── worlds.css         Worlds hub only: map, nodes, routes, detail panel
├── js/
│   ├── main.js            Entry module; registers components, runs page behavior
│   ├── site.js             Brand, nav links, contact and showroom details (edit here)
│   ├── worlds.js            The five worlds and the routes between them (edit here)
│   ├── worlds-geometry.js    routePath(): curve between two nodes (unit tested)
│   ├── transition.js          withTransition(): view transition with a plain fallback
│   ├── util.js              escapeHTML helper for template strings
│   ├── format.js             formatKm, formatKsh, carName
│   ├── ambient.js             Animated canvas backgrounds
│   ├── contact-form.js         Demo enquiry form behavior
│   ├── data/
│   │   ├── schema.js           Validator for car records (no dependencies)
│   │   └── cars.js              loadCars(): validated, shared, sold cars filtered by isListed
│   └── components/             Reusable custom elements
│       ├── site-nav.js          <site-nav current="inventory">
│       ├── site-footer.js        <site-footer>
│       ├── car-card-html.js       carCardHTML(): pure card template (unit tested)
│       ├── car-card.js             <car-grid [featured] cta="reserve|view">
│       ├── origin-filter.js        <origin-filter for="grid-id">
│       ├── stat-panel.js            <stat-panel> with <stat-item value="...">label</stat-item>
│       ├── world-map.js              <world-map>: the constellation and its detail panel
│       └── index.js                 Registers every component
├── scripts/
│   └── validate-data.js    Used by npm run validate:data
├── tests/                  node:test unit tests
├── assets/               Empty — drop real photos/logo here if you add them
├── package.json          Scripts and dev dependencies
├── vite.config.js         Multi-page build (one entry per HTML file)
├── eslint.config.js        ESLint flat config
└── .prettierrc.json         Prettier config
```

## Notes

- **Liquid glass**: the `.glass` class (frosted, blurred panels) is defined
  once in `css/styles.css` and reused everywhere — nav bar, cards, forms.
- **"Video" backgrounds**: real video files aren't included — a genuine
  background video can't be hosted or embedded in this kind of static bundle
  without a video CDN, so `js/main.js` draws an animated canvas instead (soft
  gold/green light streaks) behind the Home hero and the Inventory header.
  To add it to another section: wrap that section in `<div class="ambient">`
  with a `<canvas id="canvas-yourname">` inside, then call
  `initAmbient('canvas-yourname')` in `js/main.js` (it isn't automatic).
- **Components**: shared UI is written once as light-DOM custom elements in
  `js/components/` and used on every page, e.g. `<site-nav current="about">`
  and `<site-footer>`. They render with JavaScript, so the nav and footer
  appear once `main.js` loads; Phase 18 (SEO) revisits pre-rendering them.
  Brand name, nav links and the placeholder phone/email live in `js/site.js`.
- **Worlds (the multiverse)**: a car's journey is five stops, each a "world":
  three auction markets (Japan, United Kingdom, UAE), the Port of Mombasa and
  the Nairobi showroom. They are defined in `js/worlds.js` (name, blurb, map
  position, route order, where "Enter world" goes) and drawn by `<world-map>`
  on `worlds.html`. Nodes are real buttons, so the map works by keyboard and
  screen reader; the selected world is kept in the URL hash, so
  `worlds.html#mombasa` links straight to one. Origin worlds show live numbers
  from `data/cars.json` (cars in stock, lowest price). Positions are percentages
  of the map; keep `x` between 14 and 80 so pills are not clipped on phones (a
  test enforces it). Each origin in the data schema must have a world, also
  enforced by a test. "Enter world" currently goes to existing pages
  (`inventory.html?origin=Japan`, the home page process section, the contact
  page); Phase 6 and 7 give the worlds their own transitions and themes.
  `inventory.html?origin=UAE` (any listed origin) opens with that filter on.
- **Page transitions**: moving between pages fades, and the highlighted nav
  link glides to its new place, using cross-document View Transitions. It is
  pure CSS (`@view-transition` in `css/styles.css`), so it works in Chrome and
  Edge 126+ and Safari 18.2+; other browsers, and visitors who prefer reduced
  motion, just navigate normally. The build adds `blocking="render"` to the
  entry script (see `vite.config.js`) so the JS-drawn nav exists before the
  first paint. The inventory filter uses `withTransition()` in
  `js/transition.js`, so cards slide into their new places instead of
  jumping. Two gotchas: a `view-transition-name` must be unique on the page,
  and a named element is snapshotted on its own, which drops its backdrop
  blur, so the glass header is deliberately not named.
- **Inventory data**: edit `data/cars.json`, then run `npm run validate:data`.
  Each car needs `id` (lowercase-with-hyphens, unique), `make`, `model`, `year`,
  `origin` (Japan, United Kingdom or UAE), `mileage` (km, whole number), `fuel`
  (Petrol, Diesel, Hybrid or Electric), `grade`, `price` (whole KSh), `images`
  (list of paths, may be empty) and `status` (`available`, `reserved`,
  `incoming` or `sold`). `featured: true` puts a car on the home page. Reserved
  and incoming cars show a tag and an Enquire link; sold cars stay in the file
  but are hidden. Unknown fields are rejected so typos get caught. Everything
  in the current file, including the grades, is placeholder data.
  The loader bundles the JSON with the page and skips any invalid record with a
  console warning, so one typo can't blank the inventory; `npm run check`
  rejects it instead. `loadCars()` is async so Phase 19 can switch it to a
  fetch from an API without changing any component.
- **Colors / fonts / spacing / motion**: everything routes through CSS custom
  properties in `css/tokens.css` (`--green-*`, `--gold-*`, `--space-*`,
  `--radius-*`, `--glass-*`, `--serif`, `--sans`). Every page loads
  `tokens.css` before `styles.css`. Retheme without touching markup, and see
  every token rendered in `styleguide.html`.
- **Fonts**: Fraunces (headlines) + Inter (body/UI), loaded from Google Fonts.
- All copy (prices, addresses, phone numbers) is placeholder — replace before
  going live.

## Known issues (for Phase 17, the accessibility and responsive pass)

- At 320px wide (the smallest phones) the page scrolls sideways by about 19px
  on every page, because the nav's menu button runs past the edge. It is fine
  at 360px and up.
- At 320px the contact form is wider than the screen (about 58px over).
- The worlds map was checked in a real browser at 320, 360, 390, 820 and
  1280px: no overlapping pills, none clipped, tap targets at least 44px tall.
