# Denvar Car Imports — site source

Plain HTML/CSS/JS, no build step. Open `index.html` directly in a browser, or
serve the folder with any static server (e.g. `python3 -m http.server`) so
relative paths behave the same as on a real host.

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
│   └── main.js            Mobile menu toggle, ambient canvas backgrounds,
│                            inventory data + render + filtering
└── assets/               Empty — drop real photos/logo here if you add them
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
  `initAmbient('canvas-yourname')` in the `DOMContentLoaded` handler at the
  bottom of `main.js` (it isn't automatic).
- **Inventory data**: currently a plain JS array (`DENVAR_STOCK`) near the top
  of `main.js`. Swap it for a fetch to a real backend/CMS when you have one —
  the render function (`denvarCarCard()`) stays the same.
- **Colors / fonts / spacing / motion**: everything routes through CSS custom
  properties in `css/tokens.css` (`--green-*`, `--gold-*`, `--space-*`,
  `--radius-*`, `--glass-*`, `--serif`, `--sans`). Every page loads
  `tokens.css` before `styles.css`. Retheme without touching markup, and see
  every token rendered in `styleguide.html`.
- **Fonts**: Fraunces (headlines) + Inter (body/UI), loaded from Google Fonts.
- All copy (prices, addresses, phone numbers) is placeholder — replace before
  going live.
