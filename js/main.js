/* Denver Car Dealership — shared site behaviour.
   Edit SITE below to change contact details everywhere at once. */
(function () {
  "use strict";

  const SITE = {
    name: "Denver Car Dealership",
    short: "DCD",
    tagline: "Where value meets the road",
    phone: "+254 712 345 678",
    whatsapp: "254712345678",
    email: "sales@denzeldealerships.com",
    address: "Eldoret, Kenya",
    mapQuery: "0.5221707,35.2747672",
    hours: [["Monday – Saturday", "8:00 AM – 6:00 PM"], ["Sunday", "Closed"]],
    social: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      x: "https://x.com",
    },
    finance: { rate: 14, depositPct: 30, months: 48 },
  };

  const ICONS = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="5" width="18" height="14"/><path d="M3 6l9 7 9-7"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4a22 22 0 0 0-2.5-.1c-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>',
    car: '<svg viewBox="0 0 64 32" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 22v-5l6-2 8-7h24l10 7 8 2v5h-6"/><path d="M16 22h28"/><circle cx="11" cy="23" r="4"/><circle cx="50" cy="23" r="4"/></svg>',
  };

  /* ------------------------------------------------------------ utils */
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "KSh " + Math.round(Number(n) || 0).toLocaleString("en-KE");
  const km = (n) => (Number(n) || 0).toLocaleString("en-KE") + " km";
  const slugify = (...parts) => parts.filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const params = () => new URLSearchParams(location.search);
  const telHref = "tel:" + SITE.phone.replace(/\s/g, "");
  const waHref = (text) => `https://wa.me/${SITE.whatsapp}` + (text ? `?text=${encodeURIComponent(text)}` : "");

  /** Monthly instalment for an amortised loan. */
  function monthlyPayment(principal, annualRatePct, months) {
    if (principal <= 0 || months <= 0) return 0;
    const r = annualRatePct / 100 / 12;
    if (r === 0) return principal / months;
    return (principal * r) / (1 - Math.pow(1 + r, -months));
  }

  /* -------------------------------------------------------- inventory */
  let inventoryPromise;

  /** Loads vehicles from the server, or from data/inventory.json when the
      site is opened as plain files (e.g. Live Server / GitHub Pages). */
  function loadInventory() {
    if (!inventoryPromise) {
      inventoryPromise = fetch("/api/vehicles", { headers: { Accept: "application/json" } })
        .then((r) => (r.ok ? r.json() : Promise.reject(r)))
        .catch(() => fetch("data/inventory.json").then((r) => r.json()))
        .then((data) =>
          (data.vehicles || [])
            .filter((v) => v.status !== "draft")
            .map((v) => ({
              ...v,
              slug: v.slug || slugify(v.year, v.make, v.model),
              title: v.title || `${v.year} ${v.make} ${v.model}`,
              images: v.images || [],
              features: v.features || [],
            }))
        )
        .catch(() => []);
    }
    return inventoryPromise;
  }

  function carCard(v, opts = {}) {
    const img = v.images[0];
    const badge =
      v.status === "sold" ? '<span class="car-card__badge car-card__badge--sold">Sold</span>'
      : v.status === "reserved" ? '<span class="car-card__badge">Reserved</span>'
      : v.condition === "New" ? '<span class="car-card__badge">New</span>' : "";
    return `
      <a class="car-card${v.status === "sold" ? " is-sold" : ""}" href="vehicle.html?id=${encodeURIComponent(v.slug)}">
        <div class="car-card__media">
          ${img ? `<img src="${esc(img)}" alt="${esc(v.title)}" loading="lazy">` : ""}
          ${badge}
        </div>
        <div class="car-card__body">
          <span class="car-card__year">${esc(v.year)} · ${esc(v.body_type)}</span>
          <h3 class="car-card__title">${esc(v.make)} ${esc(v.model)}</h3>
          <span class="car-card__price">${v.status === "sold" ? "Sold" : money(v.price)}</span>
          ${opts.specs === false ? "" : `<div class="car-card__specs"><span>${km(v.mileage)}</span><span>${esc(v.transmission)}</span><span>${esc(v.fuel)}</span></div>`}
          ${opts.cta ? `<span class="link-arrow car-card__cta">${esc(opts.cta)}</span>` : ""}
        </div>
      </a>`;
  }

  /* ------------------------------------------------------ header/footer */
  const NAV = [
    ["vehicles.html", "Vehicles", "vehicles"],
    ["financing.html", "Financing", "financing"],
    ["testdrive.html", "Test Drive", "testdrive"],
    ["about.html", "About", "about"],
    ["contact.html", "Contact", "contact"],
  ];

  function currentPage() {
    const p = location.pathname.split("/").pop().replace(".html", "");
    return p === "vehicle" ? "vehicles" : p || "index";
  }

  function renderHeader() {
    const el = document.getElementById("site-header");
    if (!el) return;
    const page = currentPage();
    const navLinks = NAV.map(([href, label, key]) =>
      key === "vehicles"
        ? `<button type="button" class="mega-toggle" aria-expanded="false" aria-controls="mega">${label}</button>`
        : `<a href="${href}"${page === key ? ' aria-current="page"' : ""}>${label}</a>`
    ).join("");
    el.className = "site-header";
    el.innerHTML = `
      <div class="header-inner">
        <a class="brand" href="index.html" aria-label="${SITE.name} home">
          <span class="brand__name">DENVER</span>
          <span class="brand__sub">Car Dealership</span>
        </a>
        <nav class="nav" aria-label="Main">${navLinks}</nav>
        <div class="header-actions">
          <a class="header-phone" href="${telHref}">${SITE.phone}</a>
          <a class="btn btn--light btn--ghost" href="testdrive.html">Book a test drive</a>
          <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span></button>
        </div>
      </div>
      <div class="mega" id="mega">
        <div class="mega__inner">
          <div class="mega__cats">
            <a href="vehicles.html">All vehicles</a>
            <a href="vehicles.html?body=SUV">SUVs</a>
            <a href="vehicles.html?body=Sedan">Sedans</a>
            <a href="vehicles.html?body=Pickup">Pickups</a>
            <a href="vehicles.html?body=Hatchback">Hatchbacks</a>
            <a href="vehicles.html?condition=New">New arrivals</a>
          </div>
          <div class="mega__cars" data-mega-cars></div>
        </div>
      </div>`;

    const drawer = document.createElement("nav");
    drawer.className = "drawer";
    drawer.id = "drawer";
    drawer.setAttribute("aria-label", "Mobile");
    drawer.innerHTML = `
      <a href="index.html">Home</a>
      ${NAV.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}
      <a class="btn btn--light" href="testdrive.html">Book a test drive</a>
      <div class="drawer__contact">
        <a href="${telHref}">${SITE.phone}</a>
        <a href="mailto:${SITE.email}">${SITE.email}</a>
        <span>${SITE.address}</span>
      </div>`;
    el.after(drawer);

    // Mobile menu
    const toggle = el.querySelector(".menu-toggle");
    const setMenu = (open) => {
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
    drawer.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));

    // Vehicles mega panel
    const megaBtn = el.querySelector(".mega-toggle");
    const mega = el.querySelector(".mega");
    let filled = false;
    const setMega = (open) => {
      mega.classList.toggle("is-open", open);
      megaBtn.setAttribute("aria-expanded", open);
      el.classList.toggle("is-solid", open || window.scrollY > 40);
      if (open && !filled) {
        filled = true;
        loadInventory().then((cars) => {
          const pick = cars.filter((c) => c.status !== "sold").sort((a, b) => b.featured - a.featured).slice(0, 4);
          el.querySelector("[data-mega-cars]").innerHTML = pick.map((v) => `
            <a class="mega__car" href="vehicle.html?id=${encodeURIComponent(v.slug)}">
              ${v.images[0] ? `<img src="${esc(v.images[0])}" alt="" loading="lazy">` : ""}
              <strong>${esc(v.year)} ${esc(v.make)} ${esc(v.model)}</strong>
              <span>${money(v.price)}</span>
            </a>`).join("");
        });
      }
    };
    megaBtn.addEventListener("click", () => setMega(!mega.classList.contains("is-open")));
    document.addEventListener("click", (e) => { if (!el.contains(e.target)) setMega(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { setMega(false); setMenu(false); } });

    // Solid on scroll; hide when scrolling down, show when scrolling up
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      el.classList.toggle("is-solid", y > 40 || mega.classList.contains("is-open"));
      const hide = y > lastY && y > 400 && !mega.classList.contains("is-open") && !document.body.classList.contains("menu-open");
      el.classList.toggle("is-hidden", hide);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function renderFooter() {
    const el = document.getElementById("site-footer");
    if (!el) return;
    const year = new Date().getFullYear();
    el.className = "site-footer";
    el.innerHTML = `
      <div class="container">
        <div class="footer-top">
          <div>
            <a class="brand" href="index.html"><span class="brand__name">DENVER</span><span class="brand__sub">Car Dealership</span></a>
            <p>${SITE.tagline}. Quality new and foreign-used vehicles, flexible financing and honest advice in ${SITE.address}.</p>
            <div class="socials">
              <a href="${SITE.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ICONS.facebook}</a>
              <a href="${SITE.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}</a>
              <a href="${SITE.social.x}" target="_blank" rel="noopener" aria-label="X (Twitter)">${ICONS.x}</a>
              <a href="${waHref()}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONS.whatsapp}</a>
            </div>
          </div>
          <div class="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><a href="vehicles.html">All vehicles</a></li>
              <li><a href="vehicles.html?body=SUV">SUVs</a></li>
              <li><a href="vehicles.html?body=Sedan">Sedans</a></li>
              <li><a href="vehicles.html?body=Pickup">Pickups</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Buying tools</h4>
            <ul>
              <li><a href="financing.html">Financing</a></li>
              <li><a href="financing.html#calculator">Payment calculator</a></li>
              <li><a href="testdrive.html">Book a test drive</a></li>
              <li><a href="contact.html?subject=Trade-in">Trade-in valuation</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Visit</h4>
            <ul>
              <li>${SITE.address}</li>
              <li><a href="${telHref}">${SITE.phone}</a></li>
              <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
              ${SITE.hours.map(([d, h]) => `<li>${d}: ${h}</li>`).join("")}
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${year} ${SITE.name}. All rights reserved.</span>
          <span><a href="about.html">About</a> · <a href="contact.html">Contact</a> · <a href="about.html#privacy">Privacy</a></span>
        </div>
      </div>`;

    const wa = document.createElement("a");
    wa.className = "wa-float";
    wa.href = waHref("Hi Denver Car Dealership, I'd like to ask about a vehicle.");
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.setAttribute("aria-label", "Chat with us on WhatsApp");
    wa.innerHTML = ICONS.whatsapp;
    document.body.appendChild(wa);
  }

  /** Fill elements like <a data-site="phone"> with SITE details. */
  function bindSiteData() {
    document.querySelectorAll("[data-site]").forEach((el) => {
      const key = el.dataset.site;
      if (key === "phone") { el.textContent = SITE.phone; if (el.tagName === "A") el.href = telHref; }
      else if (key === "email") { el.textContent = SITE.email; if (el.tagName === "A") el.href = "mailto:" + SITE.email; }
      else if (key === "whatsapp" && el.tagName === "A") el.href = waHref(el.dataset.text || "");
      else if (key === "address") el.textContent = SITE.address;
      else if (key === "hours") el.innerHTML = SITE.hours.map(([d, h]) => `<li><span>${d}</span><span>${h}</span></li>`).join("");
      else if (key === "map") el.src = `https://maps.google.com/maps?q=${encodeURIComponent(SITE.mapQuery)}&z=15&output=embed`;
      else if (key === "phone-card") el.href = telHref;
      else if (key === "email-card") el.href = "mailto:" + SITE.email;
      else if (key.startsWith("social-")) { const n = key.slice(7); el.href = SITE.social[n]; el.innerHTML = ICONS[n]; }
      else if (key.endsWith("-icon")) el.innerHTML = ICONS[key.slice(0, -5)] || "";
      else if (ICONS[key]) el.innerHTML = ICONS[key];
    });
  }

  /* ----------------------------------------------------------- motion */
  function initReveal() {
    const items = document.querySelectorAll(".reveal:not(.is-in)");
    if (!("IntersectionObserver" in window)) { items.forEach((i) => i.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach((i) => io.observe(i));
  }

  /** Pause background videos while off-screen to save battery and data. */
  function initVideos() {
    const vids = document.querySelectorAll("video[autoplay]");
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) { const p = v.play(); if (p) p.catch(() => {}); } else v.pause();
      });
    });
    vids.forEach((v) => io.observe(v));
  }

  /* ------------------------------------------------------------ forms */
  /** Sends a form to the inquiries API. Returns true when it was received. */
  function initInquiryForm(form, { kind, onSuccess, extra } = {}) {
    if (!form) return;
    const status = form.querySelector(".form-status");
    const button = form.querySelector('[type="submit"]');
    const show = (msg, ok) => {
      status.innerHTML = msg;
      status.className = `form-status is-visible form-status--${ok ? "ok" : "err"}`;
      status.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      form.querySelectorAll(".is-invalid").forEach((i) => i.classList.remove("is-invalid"));
      if (!form.checkValidity()) {
        const bad = form.querySelector(":invalid");
        bad.classList.add("is-invalid");
        bad.focus();
        form.reportValidity();
        return;
      }
      const data = Object.fromEntries(new FormData(form).entries());
      data.kind = kind || data.kind;
      if (extra) Object.assign(data, extra());
      const label = button.textContent;
      button.disabled = true;
      button.textContent = "Sending…";
      try {
        const res = await fetch("/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          form.reset();
          show(onSuccess ? onSuccess(data) : "Thank you — we've received your message and will be in touch shortly.", true);
        } else if (res.status === 400 || res.status === 429) {
          Object.keys(body.fields || {}).forEach((f) => form.elements[f] && form.elements[f].classList.add("is-invalid"));
          show(esc(Object.values(body.fields || {})[0] || body.error || "Please check the form and try again."), false);
        } else {
          throw new Error("offline");
        }
      } catch (_) {
        show(`We couldn't send this online right now. Please call <a href="${telHref}">${SITE.phone}</a> or
              <a href="${waHref(composeText(data))}" target="_blank" rel="noopener">send it on WhatsApp</a> instead.`, false);
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    });
  }

  function composeText(data) {
    return Object.entries(data)
      .filter(([k, v]) => v && !["website", "consent"].includes(k))
      .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
      .join("\n");
  }

  /* ------------------------------------------------------------- boot */
  document.documentElement.classList.remove("no-js");
  document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
    bindSiteData();
    initReveal();
    initVideos();
  });

  window.DCD = { SITE, ICONS, esc, money, km, params, monthlyPayment, loadInventory, carCard, initReveal, initInquiryForm, waHref, telHref };
})();
