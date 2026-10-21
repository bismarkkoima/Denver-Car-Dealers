import { BRAND, CONTACT, NAV_LINKS, SERVICE_LINKS } from '../site.js';
import { escapeHTML } from '../util.js';

const items = (links) =>
  links.map((l) => `<li><a href="${l.href}">${escapeHTML(l.label)}</a></li>`).join('');

// <site-footer></site-footer>
class SiteFooter extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';

    const reach = [
      { href: 'contact.html', label: CONTACT.phone },
      { href: 'contact.html', label: CONTACT.email },
    ];

    this.innerHTML = `
      <footer class="site">
        <div class="wrap">
          <div class="footer-grid">
            <div>
              <div class="brand footer-brand"><span class="mark">${escapeHTML(BRAND.name)}</span></div>
              <p class="footer-blurb">Sourcing, shipping and clearing vehicles into Kenya since ${BRAND.since}.</p>
            </div>
            <div><h4>Explore</h4><ul>${items(NAV_LINKS)}</ul></div>
            <div><h4>Services</h4><ul>${items(SERVICE_LINKS)}</ul></div>
            <div><h4>Reach us</h4><ul>${items(reach)}</ul></div>
          </div>
          <div class="footer-bottom">
            <span>&copy; ${new Date().getFullYear()} ${escapeHTML(BRAND.fullName)}</span>
            <span>${escapeHTML(BRAND.location)}</span>
          </div>
        </div>
      </footer>`;
  }
}

customElements.define('site-footer', SiteFooter);
