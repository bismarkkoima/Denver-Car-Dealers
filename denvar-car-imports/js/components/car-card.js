import { loadCars, isListed } from '../data/cars.js';
import { carName, formatKm, formatKsh } from '../format.js';
import { escapeHTML } from '../util.js';

const PALETTE = [
  ['#204a31', '#10261a'],
  ['#2c6b41', '#163524'],
  ['#163524', '#0b1913'],
];

const CTAS = {
  reserve: { href: 'contact.html', label: 'Reserve' },
  view: { href: 'inventory.html', label: 'View' },
  enquire: { href: 'contact.html', label: 'Enquire' },
};

// Reserved and incoming cars get a tag and an "Enquire" link instead of "Reserve".
const STATUS_TAGS = { reserved: 'Reserved', incoming: 'Arriving soon' };

// Template function: one car as an HTML string. `index` keeps the SVG gradient
// ids unique on the page and picks the card's backdrop colors.
export function carCardHTML(car, { index = 0, cta = 'reserve' } = {}) {
  const [from, to] = PALETTE[index % PALETTE.length];
  const statusTag = STATUS_TAGS[car.status];
  const action = statusTag ? CTAS.enquire : CTAS[cta] || CTAS.reserve;
  return `
    <article class="car-card glass" data-id="${escapeHTML(car.id)}" data-origin="${escapeHTML(car.origin)}">
      <div class="car-illustration">
        <svg viewBox="0 0 400 225" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs><linearGradient id="car-grad-${index}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
          <rect width="400" height="225" fill="url(#car-grad-${index})"/>
          <path d="M50 150 Q70 100 130 95 L260 95 Q310 98 330 150 L340 150 L340 165 L30 165 L30 150 Z" fill="none" stroke="#e1c158" stroke-width="2.5"/>
          <circle cx="105" cy="165" r="18" fill="none" stroke="#e1c158" stroke-width="2.5"/>
          <circle cx="280" cy="165" r="18" fill="none" stroke="#e1c158" stroke-width="2.5"/>
        </svg>
      </div>
      <div class="tag-row">
        <span class="origin-tag">${escapeHTML(car.origin)} &middot; ${escapeHTML(car.year)}</span>
        ${statusTag ? `<span class="status-tag">${statusTag}</span>` : ''}
      </div>
      <h3>${escapeHTML(carName(car))}</h3>
      <div class="specs"><span>${escapeHTML(formatKm(car.mileage))}</span><span>${escapeHTML(car.fuel)}</span><span>Grade ${escapeHTML(car.grade)}</span><span>RHD</span></div>
      <div class="price-row">
        <div class="price">${escapeHTML(formatKsh(car.price))}<small>duty-paid estimate</small></div>
        <a class="reserve" href="${action.href}">${action.label} &rarr;</a>
      </div>
    </article>`;
}

// <car-grid class="inv-grid" cta="reserve"></car-grid>   every listed car
// <car-grid class="grid-3" featured cta="view"></car-grid> only featured cars
// The element is the grid container itself, so give it a layout class.
// `el.rendered` is a promise that settles once the cards (or an error or empty
// message) are in the DOM; data-state goes loading -> ready | empty | error.
class CarGrid extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';
    this.dataset.state = 'loading';
    this.setAttribute('aria-busy', 'true');
    this.rendered = this.#render();
  }

  async #render() {
    try {
      const featuredOnly = this.hasAttribute('featured');
      const cta = this.getAttribute('cta') || 'reserve';
      const listed = (await loadCars()).filter(isListed);
      const shown = listed
        .map((car, index) => ({ car, index }))
        .filter(({ car }) => !featuredOnly || car.featured);

      if (shown.length === 0) {
        this.dataset.state = 'empty';
        this.innerHTML = `<p class="grid-message">No cars to show right now. <a href="contact.html">Tell us what you're after</a> and we'll source it.</p>`;
        return;
      }

      this.innerHTML = shown.map(({ car, index }) => carCardHTML(car, { index, cta })).join('');
      this.dataset.state = 'ready';
    } catch (err) {
      console.error('Could not load the stock list.', err);
      this.dataset.state = 'error';
      this.innerHTML = `<p class="grid-message" role="alert">We couldn't load the stock list. Refresh the page, or <a href="contact.html">contact us</a> for what's available.</p>`;
    } finally {
      this.removeAttribute('aria-busy');
    }
  }
}

customElements.define('car-grid', CarGrid);
