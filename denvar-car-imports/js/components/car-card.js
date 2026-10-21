import { loadCars, isListed } from '../data/cars.js';
import { carCardHTML } from './car-card-html.js';

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
