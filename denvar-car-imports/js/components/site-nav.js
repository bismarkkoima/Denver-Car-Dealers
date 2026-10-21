import { BRAND, NAV_LINKS } from '../site.js';
import { escapeHTML } from '../util.js';

// <site-nav current="inventory"></site-nav>
// Renders the glass nav bar and owns its mobile menu behavior.
class SiteNav extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';

    const current = this.getAttribute('current');
    const link = (l) =>
      `<a href="${l.href}"${l.key === current ? ' aria-current="page"' : ''}>${escapeHTML(l.label)}</a>`;
    const links = NAV_LINKS.map(link).join('');

    this.innerHTML = `
      <header class="nav">
        <div class="nav-inner glass">
          <a href="index.html" class="brand">
            <span class="mark">${escapeHTML(BRAND.name)}</span>
            <span class="tag">${escapeHTML(BRAND.tag)}</span>
          </a>
          <nav class="links" aria-label="Primary">${links}</nav>
          <a class="nav-cta" href="contact.html">Talk to us</a>
          <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Menu">&#9776;</button>
          <div class="mobile-menu glass" id="mobile-menu">${links}</div>
        </div>
      </header>`;

    const btn = this.querySelector('.menu-btn');
    const menu = this.querySelector('.mobile-menu');
    const setOpen = (open) => {
      menu.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    };

    btn.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }
}

customElements.define('site-nav', SiteNav);
