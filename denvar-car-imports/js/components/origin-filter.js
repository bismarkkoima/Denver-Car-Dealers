import { loadCars, isListed } from '../data/cars.js';
import { escapeHTML } from '../util.js';

// <origin-filter for="inv-grid"></origin-filter>
// Builds one button per origin found in the listed cars, plus "All origins",
// and shows/hides the .car-card elements inside the grid named by `for`.
// `el.rendered` settles once the buttons are in the DOM.
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

      const grid = document.getElementById(this.getAttribute('for'));
      if (!grid) return;
      const filter = btn.dataset.filter;
      grid.querySelectorAll('.car-card').forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.origin !== filter;
      });
    });

    this.rendered = this.#render();
  }

  async #render() {
    try {
      const listed = (await loadCars()).filter(isListed);
      const origins = [...new Set(listed.map((car) => car.origin))];
      const options = [
        { value: 'all', label: 'All origins' },
        ...origins.map((o) => ({ value: o, label: o })),
      ];

      this.innerHTML = `
        <div class="filter-bar" role="group" aria-label="Filter by origin">
          ${options
            .map(
              (o, i) =>
                `<button type="button" aria-pressed="${i === 0}" data-filter="${escapeHTML(o.value)}">${escapeHTML(o.label)}</button>`
            )
            .join('')}
        </div>`;
    } catch (err) {
      console.error('Could not build the origin filter.', err);
    }
  }
}

customElements.define('origin-filter', OriginFilter);
