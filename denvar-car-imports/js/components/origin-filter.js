import { loadCars, isListed } from '../data/cars.js';
import { escapeHTML } from '../util.js';

// <origin-filter for="inv-grid"></origin-filter>
// Builds one button per origin found in the listed cars, plus "All origins",
// and shows/hides the .car-card elements inside the grid named by `for`.
// A link like inventory.html?origin=Japan opens with that origin selected.
// `el.rendered` settles once the buttons are in the DOM and any preselected
// origin has been applied to the grid.
class OriginFilter extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';

    this.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;

      this.querySelectorAll('button[data-filter]').forEach((b) =>
        b.setAttribute('aria-pressed', String(b === btn))
      );
      this.#apply(btn.dataset.filter);
    });

    this.rendered = this.#render();
  }

  #grid() {
    return document.getElementById(this.getAttribute('for'));
  }

  #apply(filter) {
    this.#grid()
      ?.querySelectorAll('.car-card')
      .forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.origin !== filter;
      });
  }

  async #render() {
    try {
      const listed = (await loadCars()).filter(isListed);
      const origins = [...new Set(listed.map((car) => car.origin))];
      const options = [
        { value: 'all', label: 'All origins' },
        ...origins.map((o) => ({ value: o, label: o })),
      ];

      // Only an origin we actually list can be preselected; anything else in
      // the URL is ignored.
      const wanted = new URLSearchParams(location.search).get('origin');
      const initial = origins.includes(wanted) ? wanted : 'all';

      this.innerHTML = `
        <div class="filter-bar" role="group" aria-label="Filter by origin">
          ${options
            .map(
              (o) =>
                `<button type="button" aria-pressed="${o.value === initial}" data-filter="${escapeHTML(o.value)}">${escapeHTML(o.label)}</button>`
            )
            .join('')}
        </div>`;

      if (initial !== 'all') {
        await this.#grid()?.rendered; // the cards must exist before they can be hidden
        this.#apply(initial);
      }
    } catch (err) {
      console.error('Could not build the origin filter.', err);
    }
  }
}

customElements.define('origin-filter', OriginFilter);
