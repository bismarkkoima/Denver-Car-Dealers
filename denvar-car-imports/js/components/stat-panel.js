import { escapeHTML } from '../util.js';

// <stat-panel>
//   <stat-item value="1,240+">vehicles landed since 2016</stat-item>
// </stat-panel>
// The item text is the label, so the numbers stay readable without JavaScript.
class StatPanel extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';

    const stats = [...this.querySelectorAll('stat-item')].map((item) => ({
      value: item.getAttribute('value') || '',
      label: item.textContent.trim(),
    }));

    this.innerHTML = `
      <div class="hero-panel glass">
        ${stats
          .map(
            (s) =>
              `<div class="stat"><div class="num">${escapeHTML(s.value)}</div><div class="lbl">${escapeHTML(s.label)}</div></div>`
          )
          .join('')}
      </div>`;
  }
}

customElements.define('stat-panel', StatPanel);
