import { STOCK } from '../stock.js';
import { escapeHTML } from '../util.js';

// <origin-filter for="inv-grid"></origin-filter>
// Builds one button per origin found in the stock, plus "All origins", and
// shows/hides the .car-card elements inside the grid named by `for`.
class OriginFilter extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';

    const origins = [...new Set(STOCK.map((car) => car.origin))];
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
  }
}

customElements.define('origin-filter', OriginFilter);
