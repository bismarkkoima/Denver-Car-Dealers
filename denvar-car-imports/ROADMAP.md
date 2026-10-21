# Denvar Multiverse — 20-Phase Roadmap

Goal: evolve the 4-page Denvar Car Imports site into a sleek, modern "multiverse" — a connected set of immersive worlds (one per origin market and one per buyer journey) that you travel between with fluid transitions, all in the green/gold liquid-glass language.

Stack stays light: HTML, CSS, vanilla JS first; adopt a bundler and framework only where a phase calls for it.

## Foundation

**Phase 1 — Design system & tokens. ✅ Done.** Extract colors, type scale, spacing, radii, glass levels and motion curves into `css/tokens.css`. Document each in a `/styleguide.html` page.

**Phase 2 — Project tooling. ✅ Done.** Add Vite, ESLint, Prettier, and a `package.json` with `dev`, `build`, `preview`. Move to ES modules; keep output static-hostable.

**Phase 3 — Componentization. ✅ Done.** Break nav, footer, car card, filter bar, and stat panels into reusable modules (web components or template functions) so pages stop duplicating markup.

**Phase 4 — Data layer.** Move stock out of `js/stock.js` into `data/cars.json` with a schema (id, make, model, year, origin, mileage, grade, price, images, status). Add a small loader with validation.

## The Multiverse Shell

**Phase 5 — Universe concept & map.** Define the "worlds": Japan, UK, UAE, Port of Mombasa, Showroom. Build a hub page: a glass constellation map where each world is a node you enter.

**Phase 6 — Seamless page transitions.** View Transitions API with a fallback, so moving between worlds morphs shared elements (car card to detail, nav pill to new page) rather than hard-reloading.

**Phase 7 — Per-world theming.** Each world overrides tokens: Japan (cool jade, neon accent), UK (deep moss, brass), UAE (sand and gold), Mombasa (ocean teal). Theme switches live during transitions.

**Phase 8 — Hero rebuild with WebGL.** Replace the canvas streaks with a Three.js or raw-WebGL shader backdrop (flowing light ribbons, parallax on pointer/gyro). Ship a lightweight static fallback for low-power devices and reduced motion.

## Immersive Content

**Phase 9 — Real video backgrounds.** Host short looped, compressed (WebM + MP4) clips in `assets/video/`, lazy-loaded with poster frames, muted/inline, paused off-screen and under reduced motion. Budget each clip under ~2 MB.

**Phase 10 — Vehicle detail pages.** `car.html?id=` with a gallery, spec sheet, auction-grade explainer, landed-cost breakdown, and a sticky "Reserve this car" panel.

**Phase 11 — 3D / 360° viewer.** Spin-able exterior viewer from image sequences (or glTF where models exist), with hotspots for condition notes.

**Phase 12 — Landed-cost calculator.** Interactive tool: car price, origin, engine size, age → estimated duty, shipping, clearing, registration. Rates live in a config file so they're easy to update against the current KRA schedule.

## Interaction & Polish

**Phase 13 — Advanced inventory.** Multi-facet filters (origin, price, fuel, year, grade), sort, search, URL-synced state, saved shortlist in localStorage, and animated list reflow.

**Phase 14 — Micro-interactions.** Magnetic buttons, glass specular highlights that follow the cursor, scroll-linked reveals, number count-ups, and tactile hover states — all gated behind reduced-motion.

**Phase 15 — Sound & haptics (optional, off by default).** Subtle UI sounds and mobile haptics behind an explicit toggle, remembered per user.

## Quality

**Phase 16 — Performance pass.** Image pipeline (AVIF/WebP, responsive srcset), font subsetting, critical CSS, code-splitting the WebGL bundle. Targets: LCP under 2.5 s on mid-range Android over 4G, CLS under 0.05.

**Phase 17 — Accessibility pass.** Keyboard paths through every world, focus management across transitions, ARIA for the map and viewer, contrast audit, screen-reader labels, full reduced-motion parity.

**Phase 18 — SEO & sharing.** Per-page metadata, Open Graph cards per car, structured data (Vehicle/Offer), sitemap, robots, and clean URLs.

## Launch

**Phase 19 — Backend & enquiries.** Replace the demo form with a real endpoint (serverless function) that stores enquiries and notifies by email/WhatsApp; add spam protection and a thank-you flow. Optional lightweight admin to edit stock.

**Phase 20 — CI/CD & go-live.** GitHub Actions for lint, build, and Lighthouse checks; deploy to GitHub Pages or Netlify/Vercel with a custom domain, analytics, and a launch checklist replacing every placeholder price, address and phone number.

## Suggested order of work

Phases 1–4 first (they unblock everything), then 5–8 for the multiverse feel, then 9–15 in any order by priority, with 16–18 before launch and 19–20 last.
