import { loadCars, isListed } from '../data/cars.js';
import { formatKsh } from '../format.js';
import { escapeHTML } from '../util.js';
import { KIND_LABELS, ROUTES, WORLDS, worldById } from '../worlds.js';
import { routePath } from '../worlds-geometry.js';

// <world-map></world-map>
// A constellation of the five worlds a car passes through, with a detail panel
// for whichever one is selected. Nodes are real buttons, so the map works with a
// keyboard and a screen reader. The selected world is mirrored in the URL hash
// (worlds.html#mombasa) so a world can be linked to directly.
// `el.rendered` settles once the live stock numbers have been added.
class WorldMap extends HTMLElement {
  #stats = {}; // origin -> { count, from }
  #selected = WORLDS[0].id;
  #onHashChange = () => {
    const id = location.hash.slice(1);
    if (worldById(id) && id !== this.#selected) this.#select(id);
  };

  connectedCallback() {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';

    const fromHash = location.hash.slice(1);
    if (worldById(fromHash)) this.#selected = fromHash;

    this.#build();
    this.addEventListener('click', (e) => {
      const node = e.target.closest('.world-node[data-world]');
      if (node) this.#select(node.dataset.world, { updateHash: true });
    });
    window.addEventListener('hashchange', this.#onHashChange);
    this.rendered = this.#loadStats();
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.#onHashChange);
  }

  #build() {
    const paths = ROUTES.map(([from, to]) => {
      const d = routePath(worldById(from).pos, worldById(to).pos);
      return `<path d="${d}" data-from="${from}" data-to="${to}"/>`;
    }).join('');

    const nodes = WORLDS.map(
      (w) => `
        <button type="button" class="world-node" data-world="${w.id}" data-kind="${w.kind}"
          aria-pressed="${w.id === this.#selected}" aria-label="${escapeHTML(w.name)}"
          style="--x:${w.pos.x};--y:${w.pos.y}">
          <span class="dot" aria-hidden="true"></span>
          <span class="label-full" aria-hidden="true">${escapeHTML(w.name)}</span>
          <span class="label-short" aria-hidden="true">${escapeHTML(w.short)}</span>
        </button>`
    ).join('');

    this.innerHTML = `
      <div class="worlds-layout">
        <div class="world-map glass" role="group" aria-label="Journey map">
          <svg class="world-routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">${paths}</svg>
          ${nodes}
          <p class="sr-only">Cars travel from the three auction markets to the Port of Mombasa, then to the Nairobi showroom. Select a stop to read about it.</p>
        </div>
        <section class="world-detail glass" aria-labelledby="world-title"></section>
      </div>`;

    this.#render();
  }

  async #loadStats() {
    try {
      const listed = (await loadCars()).filter(isListed);
      for (const car of listed) {
        const s = (this.#stats[car.origin] ??= { count: 0, from: Infinity });
        s.count += 1;
        s.from = Math.min(s.from, car.price);
      }
    } catch (err) {
      console.error('Could not load stock numbers for the world map.', err);
    }
    this.dataset.stats = 'loaded';
    this.#render();
  }

  #select(id, { updateHash = false } = {}) {
    this.#selected = id;
    if (updateHash) history.replaceState(null, '', `#${id}`);
    // Announce the new world to screen readers, but only after the visitor has
    // chosen one, so the page does not read the panel out on load.
    this.querySelector('.world-detail').setAttribute('aria-live', 'polite');
    this.#render();
  }

  // Live lines for origin worlds, built from the stock data.
  #liveFacts(world) {
    if (world.kind !== 'origin' || this.dataset.stats !== 'loaded') return [];
    const s = this.#stats[world.origin];
    if (!s) return ['No cars listed right now. Ask us to source one.'];
    return [`${s.count} ${s.count === 1 ? 'car' : 'cars'} in stock`, `From ${formatKsh(s.from)}`];
  }

  #render() {
    const world = worldById(this.#selected);

    this.querySelectorAll('.world-node').forEach((node) =>
      node.setAttribute('aria-pressed', String(node.dataset.world === world.id))
    );
    this.querySelectorAll('.world-routes path').forEach((path) =>
      path.classList.toggle(
        'is-active',
        path.dataset.from === world.id || path.dataset.to === world.id
      )
    );

    const facts = [...this.#liveFacts(world), ...world.facts];
    this.querySelector('.world-detail').innerHTML = `
      <p class="world-kind">${escapeHTML(KIND_LABELS[world.kind])}</p>
      <h2 id="world-title">${escapeHTML(world.name)}</h2>
      <p class="world-blurb">${escapeHTML(world.blurb)}</p>
      ${facts.length ? `<ul class="world-facts">${facts.map((f) => `<li>${escapeHTML(f)}</li>`).join('')}</ul>` : ''}
      <a class="btn-primary" href="${escapeHTML(world.enter.href)}">${escapeHTML(world.enter.label)}</a>`;
    this.dataset.selected = world.id;
  }
}

customElements.define('world-map', WorldMap);
