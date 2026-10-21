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
│   ├── main.js            Entry module; imports and runs the modules below
│   ├── nav.js              Mobile menu toggle
│   ├── ambient.js           Animated canvas backgrounds
│   ├── inventory.js          Car card render + origin filter
│   ├── stock.js               Placeholder stock data
│   └── contact-form.js         Demo enquiry form behavior
├── assets/               Empty — drop real photos/logo here if you add them
├── package.json          Scripts and dev dependencies
├── vite.config.js         Multi-page build (one entry per HTML file)
├── eslint.config.js        ESLint flat config
└── .prettierrc.json         Prettier config (HTML is ignored until Phase 3)
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
- **Inventory data**: currently a plain JS array in `js/stock.js`. Swap it for
  a fetch to a real backend/CMS when you have one — the render function in
  `js/inventory.js` stays the same. Phase 4 moves this to `data/cars.json`.
- **Colors / fonts / spacing / motion**: everything routes through CSS custom
  properties in `css/tokens.css` (`--green-*`, `--gold-*`, `--space-*`,
  `--radius-*`, `--glass-*`, `--serif`, `--sans`). Every page loads
  `tokens.css` before `styles.css`. Retheme without touching markup, and see
  every token rendered in `styleguide.html`.
- **Fonts**: Fraunces (headlines) + Inter (body/UI), loaded from Google Fonts.
- All copy (prices, addresses, phone numbers) is placeholder — replace before
  going live.
