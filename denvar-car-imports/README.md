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
```

Requires Node 20 or newer. The build uses a relative base (`./`), so `dist/`
works on GitHub Pages, Netlify, or inside a subfolder.

## Structure

```
denvar-car-imports/
├── index.html        Home
├── inventory.html     Inventory (car grid + origin filter)
├── about.html          About / company story
├── contact.html         Contact form + info
├── styleguide.html       Living style guide rendered from the tokens
├── ROADMAP.md             20-phase plan for the multiverse redesign
├── css/
│   ├── tokens.css         Design tokens: colors, glass, type, spacing, radii, motion
│   └── styles.css         Layout, components and breakpoints (reads tokens.css)
├── js/
│   ├── main.js            Entry module; registers components, runs page behavior
│   ├── site.js             Brand, nav links, contact placeholders (edit here)
│   ├── util.js              escapeHTML helper for template strings
│   ├── stock.js              Placeholder stock (the featured flag drives the home page)
│   ├── ambient.js             Animated canvas backgrounds
│   ├── contact-form.js         Demo enquiry form behavior
│   └── components/             Reusable custom elements
│       ├── site-nav.js          <site-nav current="inventory">
│       ├── site-footer.js        <site-footer>
│       ├── car-card.js            carCardHTML() and <car-grid [featured] cta="reserve|view">
│       ├── origin-filter.js        <origin-filter for="grid-id">
│       ├── stat-panel.js            <stat-panel> with <stat-item value="...">label</stat-item>
│       └── index.js                 Registers every component
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
- **Inventory data**: currently a plain JS array in `js/stock.js`. Swap it for
  a fetch to a real backend/CMS when you have one — `<car-grid>` and
  `<origin-filter>` read from it. Phase 4 moves this to `data/cars.json`.
- **Colors / fonts / spacing / motion**: everything routes through CSS custom
  properties in `css/tokens.css` (`--green-*`, `--gold-*`, `--space-*`,
  `--radius-*`, `--glass-*`, `--serif`, `--sans`). Every page loads
  `tokens.css` before `styles.css`. Retheme without touching markup, and see
  every token rendered in `styleguide.html`.
- **Fonts**: Fraunces (headlines) + Inter (body/UI), loaded from Google Fonts.
- All copy (prices, addresses, phone numbers) is placeholder — replace before
  going live.
