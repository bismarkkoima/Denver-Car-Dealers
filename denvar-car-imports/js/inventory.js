import { STOCK } from './stock.js';

const PALETTE = [
  ['#204A31', '#10261A'],
  ['#2C6B41', '#163524'],
  ['#163524', '#0B1913'],
];

function carCard(item, idx) {
  const [from, to] = PALETTE[idx % PALETTE.length];
  return `
    <article class="car-card glass" data-origin="${item.origin}">
      <div class="car-illustration">
        <svg viewBox="0 0 400 225" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="225" fill="url(#grad${idx})"/>
          <defs><linearGradient id="grad${idx}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
          <path d="M50 150 Q70 100 130 95 L260 95 Q310 98 330 150 L340 150 L340 165 L30 165 L30 150 Z" fill="none" stroke="#E1C158" stroke-width="2.5"/>
          <circle cx="105" cy="165" r="18" fill="none" stroke="#E1C158" stroke-width="2.5"/>
          <circle cx="280" cy="165" r="18" fill="none" stroke="#E1C158" stroke-width="2.5"/>
        </svg>
      </div>
      <span class="origin-tag">${item.origin} &middot; ${item.year}</span>
      <h3>${item.name}</h3>
      <div class="specs"><span>${item.km} km</span><span>${item.fuel}</span><span>RHD</span></div>
      <div class="price-row">
        <div class="price">KSh ${item.price}<small>duty-paid estimate</small></div>
        <a class="reserve" href="contact.html">Reserve &rarr;</a>
      </div>
    </article>`;
}

// Renders the grid and wires the origin filter (inventory.html only).
export function initInventory() {
  const grid = document.getElementById('inv-grid');
  if (!grid) return;
  grid.innerHTML = STOCK.map(carCard).join('');

  const filterBtns = document.querySelectorAll('.filter-bar button');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      const filter = btn.dataset.filter;
      grid.querySelectorAll('.car-card').forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.origin !== filter;
      });
    });
  });
}
