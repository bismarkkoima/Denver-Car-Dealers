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
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5c-2.2 4.6-9.2 9-9.2 9z"/></svg>',
    compare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="7" height="16"/><rect x="14" y="4" width="7" height="16"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M14.5 6.5a4 4 0 0 0 5 5L21 13l-8 8-3-3 6.5-6.5M14.5 6.5L9.5 3 3 9.5l3.5 5"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
    calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5" y="3" width="14" height="18"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 8h14l-4-4M20 16H6l4 4"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
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

  /** Largest loan a given monthly instalment can repay. */
  function loanFromPayment(payment, annualRatePct, months) {
    if (payment <= 0 || months <= 0) return 0;
    const r = annualRatePct / 100 / 12;
    if (r === 0) return payment * months;
    return (payment * (1 - Math.pow(1 + r, -months))) / r;
  }

  /* --------------------------------------- saved & compare (per browser) */
  const COMPARE_MAX = 3;
  const lists = {
    read(key) {
      try { return JSON.parse(localStorage.getItem("dcd:" + key)) || []; } catch (_) { return []; }
    },
    write(key, value) {
      try { localStorage.setItem("dcd:" + key, JSON.stringify(value)); } catch (_) { /* storage blocked */ }
      document.dispatchEvent(new CustomEvent("dcd:lists"));
    },
    has(key, slug) { return this.read(key).includes(slug); },
    toggle(key, slug, max) {
      const items = this.read(key);
      const i = items.indexOf(slug);
      if (i >= 0) items.splice(i, 1);
      else if (max && items.length >= max) return { added: false, full: true };
      else items.push(slug);
      this.write(key, items);
      return { added: i < 0, full: false };
    },
  };

  let toastTimer;
  function toast(html) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.innerHTML = html;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 3200);
  }

  function syncListButtons() {
    const saved = lists.read("saved");
    const compare = lists.read("compare");
    document.querySelectorAll("[data-save]").forEach((b) => {
      const on = saved.includes(b.dataset.save);
      b.setAttribute("aria-pressed", on);
      if (b.dataset.label !== undefined) b.querySelector("span").textContent = on ? "Saved" : "Save";
    });
    document.querySelectorAll("[data-compare]").forEach((b) => {
      const on = compare.includes(b.dataset.compare);
      b.setAttribute("aria-pressed", on);
      if (b.dataset.label !== undefined) b.querySelector("span").textContent = on ? "Comparing" : "Compare";
    });
    document.querySelectorAll("[data-saved-count]").forEach((el) => {
      el.textContent = saved.length;
      el.hidden = !saved.length;
    });
  }

  document.addEventListener("click", (e) => {
    const save = e.target.closest("[data-save]");
    const cmp = e.target.closest("[data-compare]");
    if (save) {
      e.preventDefault();
      const { added } = lists.toggle("saved", save.dataset.save);
      toast(added ? 'Saved. <a href="saved.html">View saved vehicles</a>' : "Removed from saved vehicles");
    } else if (cmp) {
      e.preventDefault();
      const { added, full } = lists.toggle("compare", cmp.dataset.compare, COMPARE_MAX);
      if (full) toast(`You can compare up to ${COMPARE_MAX} vehicles. <a href="compare.html">Compare now</a>`);
      else toast(added ? 'Added to compare. <a href="compare.html">Compare now</a>' : "Removed from compare");
    }
  });
  document.addEventListener("dcd:lists", () => { syncListButtons(); renderCompareTray(); });
  window.addEventListener("storage", (e) => { if (e.key && e.key.startsWith("dcd:")) document.dispatchEvent(new CustomEvent("dcd:lists")); });

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
              was_price: Number(v.was_price) || 0,
              on_offer: v.on_offer ?? (Number(v.was_price) > Number(v.price) && v.status !== "sold"),
            }))
        )
        .catch(() => []);
    }
    return inventoryPromise;
  }

  function priceHtml(v) {
    if (v.status === "sold") return "Sold";
    return money(v.price) + (v.on_offer ? ` <s>${money(v.was_price)}</s>` : "");
  }

  function carCard(v, opts = {}) {
    const img = v.images[0];
    const href = `vehicle.html?id=${encodeURIComponent(v.slug)}`;
    const badge =
      v.status === "sold" ? '<span class="car-card__badge car-card__badge--sold">Sold</span>'
      : v.status === "reserved" ? '<span class="car-card__badge">Reserved</span>'
      : v.on_offer ? `<span class="car-card__badge car-card__badge--offer">Save ${money(v.was_price - v.price)}</span>`
      : v.condition === "New" ? '<span class="car-card__badge">New</span>' : "";
    return `
      <article class="car-card${v.status === "sold" ? " is-sold" : ""}">
        <div class="car-card__media">
          <a href="${href}" tabindex="-1" aria-hidden="true">${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : ""}</a>
          ${badge}
          <div class="car-card__tools">
            <button type="button" class="icon-btn" data-save="${esc(v.slug)}" aria-pressed="false" aria-label="Save ${esc(v.title)}">${ICONS.heart}</button>
            <button type="button" class="icon-btn" data-compare="${esc(v.slug)}" aria-pressed="false" aria-label="Compare ${esc(v.title)}">${ICONS.compare}</button>
          </div>
        </div>
        <div class="car-card__body">
          <span class="car-card__year">${esc(v.year)} · ${esc(v.body_type)}</span>
          <h3 class="car-card__title"><a href="${href}">${esc(v.make)} ${esc(v.model)}</a></h3>
          <span class="car-card__price">${priceHtml(v)}</span>
          ${opts.specs === false ? "" : `<div class="car-card__specs"><span>${km(v.mileage)}</span><span>${esc(v.transmission)}</span><span>${esc(v.fuel)}</span></div>`}
          ${opts.cta ? `<a class="link-arrow car-card__cta" href="${href}" tabindex="-1">${esc(opts.cta)}</a>` : ""}
        </div>
      </article>`;
  }

  /** Render car cards into a container and wire up their save/compare state. */
  function renderCards(container, cars, opts) {
    container.innerHTML = cars.map((c) => carCard(c, opts)).join("");
    syncListButtons();
  }

  /* ------------------------------------------------------ header/footer */
  const TOOLS = [
    ["vehicles.html", "Search inventory", "Browse every vehicle in stock", "search"],
    ["vehicles.html?offers=1", "Current offers", "Reduced prices on selected cars", "tag"],
    ["financing.html#calculator", "Estimate payments", "See your monthly instalment", "calc"],
    ["financing.html#prequalify", "Get pre-qualified", "Find your budget in 60 seconds", "check"],
    ["sell.html", "Sell or trade in", "Get an offer for your current car", "swap"],
    ["testdrive.html", "Book a test drive", "At the showroom or at your door", "key"],
    ["compare.html", "Compare vehicles", "Line up to three cars side by side", "grid"],
    ["service.html", "Book a service", "Maintenance, repairs and inspections", "wrench"],
  ];

  function currentPage() {
    const p = location.pathname.split("/").pop().replace(".html", "");
    return p === "vehicle" ? "vehicles" : p || "index";
  }

  function renderHeader() {
    const el = document.getElementById("site-header");
    if (!el) return;
    const page = currentPage();
    const toolPages = ["financing", "testdrive", "sell", "compare", "saved"];
    const cur = (keys) => ([].concat(keys).includes(page) ? ' data-current="true"' : "");
    el.className = "site-header";
    el.innerHTML = `
      <div class="header-inner">
        <a class="brand" href="index.html" aria-label="${SITE.name} home">
          <span class="brand__name">DENVER</span>
          <span class="brand__sub">Car Dealership</span>
        </a>
        <nav class="nav" aria-label="Main">
          <button type="button" data-panel="mega-vehicles" aria-expanded="false" aria-controls="mega-vehicles"${cur("vehicles")}>Vehicles</button>
          <button type="button" data-panel="mega-tools" aria-expanded="false" aria-controls="mega-tools"${cur(toolPages)}>Shopping tools</button>
          <a href="service.html"${page === "service" ? ' aria-current="page"' : ""}>Service</a>
          <a href="about.html"${page === "about" ? ' aria-current="page"' : ""}>About</a>
          <a href="contact.html"${page === "contact" ? ' aria-current="page"' : ""}>Contact</a>
        </nav>
        <div class="header-actions">
          <button type="button" class="header-icon" data-panel="search-panel" aria-expanded="false" aria-controls="search-panel" aria-label="Search vehicles">${ICONS.search}</button>
          <a class="header-icon" href="saved.html" aria-label="Saved vehicles">${ICONS.heart}<span class="count" data-saved-count hidden>0</span></a>
          <a class="btn btn--light btn--ghost" href="testdrive.html">Book a test drive</a>
          <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span></button>
        </div>
      </div>
      <div class="mega" id="mega-vehicles">
        <div class="mega__inner">
          <div class="mega__cats">
            <a href="vehicles.html">All vehicles</a>
            <a href="vehicles.html?body=SUV">SUVs</a>
            <a href="vehicles.html?body=Sedan">Sedans</a>
            <a href="vehicles.html?body=Pickup">Pickups</a>
            <a href="vehicles.html?body=Hatchback">Hatchbacks</a>
            <a href="vehicles.html?offers=1">Current offers</a>
            <a href="vehicles.html?condition=New">New arrivals</a>
          </div>
          <div class="mega__cars" data-mega-cars></div>
        </div>
      </div>
      <div class="mega" id="mega-tools">
        <div class="mega__inner mega__inner--tools">
          ${TOOLS.map(([href, title, sub, icon]) => `
            <a class="tool-link" href="${href}">
              ${ICONS[icon]}
              <strong>${title}</strong>
              <span>${sub}</span>
            </a>`).join("")}
        </div>
      </div>
      <div class="mega search-panel" id="search-panel">
        <form class="search-panel__form" action="vehicles.html" role="search">
          ${ICONS.search}
          <label class="sr-only" for="site-search">Search vehicles</label>
          <input id="site-search" name="q" type="search" placeholder="Search by make, model or year" autocomplete="off">
          <button class="btn btn--light" type="submit">Search</button>
        </form>
        <div class="search-panel__quick">
          <span>Popular:</span>
          <a href="vehicles.html?q=Land%20Cruiser">Land Cruiser</a>
          <a href="vehicles.html?q=Mercedes">Mercedes-Benz</a>
          <a href="vehicles.html?body=SUV">SUVs</a>
          <a href="vehicles.html?offers=1">Offers</a>
          <a href="vehicles.html?max=5000000">Under KSh 5M</a>
        </div>
      </div>`;

    const drawer = document.createElement("nav");
    drawer.className = "drawer";
    drawer.id = "drawer";
    drawer.setAttribute("aria-label", "Mobile");
    drawer.innerHTML = `
      <form class="drawer__search" action="vehicles.html" role="search">
        <input name="q" type="search" placeholder="Search vehicles" aria-label="Search vehicles">
        <button type="submit" aria-label="Search">${ICONS.search}</button>
      </form>
      <a href="index.html">Home</a>
      <a href="vehicles.html">Vehicles</a>
      <a href="vehicles.html?offers=1">Current offers</a>
      <details class="drawer__group">
        <summary>Shopping tools</summary>
        ${TOOLS.map(([href, title]) => `<a href="${href}">${title}</a>`).join("")}
      </details>
      <a href="service.html">Service</a>
      <a href="saved.html">Saved vehicles</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
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
    toggle.addEventListener("click", () => { closePanels(); setMenu(!document.body.classList.contains("menu-open")); });
    drawer.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));

    // Mega panels (Vehicles, Shopping tools, Search): one open at a time
    const triggers = el.querySelectorAll("[data-panel]");
    let carsFilled = false;
    const anyOpen = () => !!el.querySelector(".mega.is-open");
    function closePanels() {
      el.querySelectorAll(".mega.is-open").forEach((p) => p.classList.remove("is-open"));
      triggers.forEach((t) => t.setAttribute("aria-expanded", "false"));
      el.classList.toggle("is-solid", window.scrollY > 40);
    }
    function openPanel(id) {
      const panel = el.querySelector("#" + id);
      const wasOpen = panel.classList.contains("is-open");
      closePanels();
      if (wasOpen) return;
      panel.classList.add("is-open");
      el.querySelectorAll(`[data-panel="${id}"]`).forEach((t) => t.setAttribute("aria-expanded", "true"));
      el.classList.add("is-solid");
      if (id === "search-panel") setTimeout(() => panel.querySelector("input").focus(), 50);
      if (id === "mega-vehicles" && !carsFilled) {
        carsFilled = true;
        loadInventory().then((cars) => {
          const pick = cars.filter((c) => c.status !== "sold").sort((a, b) => b.featured - a.featured).slice(0, 4);
          el.querySelector("[data-mega-cars]").innerHTML = pick.map((v) => `
            <a class="mega__car" href="vehicle.html?id=${encodeURIComponent(v.slug)}">
              ${v.images[0] ? `<img src="${esc(v.images[0])}" alt="" loading="lazy">` : ""}
              <strong>${esc(v.year)} ${esc(v.make)} ${esc(v.model)}</strong>
              <span>${priceHtml(v)}</span>
            </a>`).join("");
        });
      }
    }
    triggers.forEach((t) => t.addEventListener("click", () => openPanel(t.dataset.panel)));
    document.addEventListener("click", (e) => { if (!el.contains(e.target)) closePanels(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closePanels(); setMenu(false); } });

    // Solid on scroll; hide when scrolling down, show when scrolling up
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      el.classList.toggle("is-solid", y > 40 || anyOpen());
      const hide = y > lastY && y > 400 && !anyOpen() && !document.body.classList.contains("menu-open");
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
        <div class="footer-news">
          <div>
            <p class="eyebrow" style="color: var(--muted-dark)">Stay in the know</p>
            <h3 class="display display--md" style="margin-top: 10px">New arrivals &amp; offers, first</h3>
          </div>
          <form class="footer-news__form" data-newsletter novalidate>
            <label class="sr-only" for="news-email">Email address</label>
            <input id="news-email" name="email" type="email" placeholder="Your email address" autocomplete="email" required>
            <label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
            <button class="btn btn--light" type="submit">Subscribe</button>
            <div class="form-status" role="status" aria-live="polite"></div>
          </form>
        </div>
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
            <h4>Vehicles</h4>
            <ul>
              <li><a href="vehicles.html">All vehicles</a></li>
              <li><a href="vehicles.html?offers=1">Current offers</a></li>
              <li><a href="vehicles.html?body=SUV">SUVs</a></li>
              <li><a href="vehicles.html?body=Sedan">Sedans</a></li>
              <li><a href="vehicles.html?body=Pickup">Pickups</a></li>
              <li><a href="compare.html">Compare</a></li>
              <li><a href="saved.html">Saved vehicles</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Shopping tools</h4>
            <ul>
              <li><a href="financing.html">Financing</a></li>
              <li><a href="financing.html#prequalify">Get pre-qualified</a></li>
              <li><a href="financing.html#calculator">Payment calculator</a></li>
              <li><a href="testdrive.html">Book a test drive</a></li>
              <li><a href="sell.html">Sell or trade in</a></li>
              <li><a href="service.html">Book a service</a></li>
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

    initInquiryForm(el.querySelector("[data-newsletter]"), {
      kind: "newsletter",
      onSuccess: (_data, body) => body && body.already
        ? "You're already subscribed. Thanks for being with us!"
        : "You're in! Watch your inbox for new arrivals and offers.",
    });

    const wa = document.createElement("a");
    wa.className = "wa-float";
    wa.href = waHref("Hi Denver Car Dealership, I'd like to ask about a vehicle.");
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.setAttribute("aria-label", "Chat with us on WhatsApp");
    wa.innerHTML = ICONS.whatsapp;
    document.body.appendChild(wa);
  }

  /* ---------------------------------------------------- compare tray */
  function renderCompareTray() {
    if (currentPage() === "compare" || !document.body) return;
    let tray = document.querySelector(".compare-tray");
    const slugs = lists.read("compare");
    if (!slugs.length) {
      if (tray) tray.classList.remove("is-visible");
      document.body.classList.remove("has-tray");
      return;
    }
    if (!tray) {
      tray = document.createElement("aside");
      tray.className = "compare-tray";
      tray.setAttribute("aria-label", "Vehicles to compare");
      document.body.appendChild(tray);
      tray.addEventListener("click", (e) => {
        if (e.target.closest("[data-clear-compare]")) lists.write("compare", []);
      });
    }
    loadInventory().then((cars) => {
      const picked = slugs.map((s) => cars.find((c) => c.slug === s)).filter(Boolean);
      const slots = Array.from({ length: COMPARE_MAX }, (_, i) => picked[i]);
      tray.innerHTML = `
        <div class="compare-tray__inner">
          <span class="eyebrow">Compare <span class="compare-tray__count">${picked.length}/${COMPARE_MAX}</span></span>
          <div class="compare-tray__slots">
            ${slots.map((v) => v
              ? `<div class="compare-tray__slot">
                   ${v.images[0] ? `<img src="${esc(v.images[0])}" alt="">` : ""}
                   <span>${esc(v.year)} ${esc(v.model)}</span>
                   <button type="button" data-compare="${esc(v.slug)}" aria-label="Remove ${esc(v.title)}">${ICONS.close}</button>
                 </div>`
              : '<div class="compare-tray__slot compare-tray__slot--empty"><span>Add a vehicle</span></div>').join("")}
          </div>
          <div class="compare-tray__actions">
            <button type="button" class="link-btn" data-clear-compare>Clear</button>
            <a class="btn btn--light" href="compare.html">Compare${picked.length < 2 ? "" : ` (${picked.length})`}</a>
          </div>
        </div>`;
      tray.classList.add("is-visible");
      document.body.classList.add("has-tray");
    });
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
  /** Sends a form to the inquiries API.
      opts.files() may return File objects to upload (sent as multipart). */
  function initInquiryForm(form, { kind, onSuccess, extra, files, beforeSubmit } = {}) {
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
      if (beforeSubmit && beforeSubmit() === false) return;
      const data = {};
      new FormData(form).forEach((v, k) => { if (typeof v === "string") data[k] = v; });
      data.kind = kind || data.kind;
      if (extra) Object.assign(data, extra());
      Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
      const uploads = files ? files() : [];
      const label = button.textContent;
      button.disabled = true;
      button.textContent = uploads.length ? "Uploading…" : "Sending…";
      try {
        let request;
        if (uploads.length) {
          const body = new FormData();
          Object.entries(data).forEach(([k, v]) => body.append(k, v));
          uploads.forEach((f) => body.append("photos", f, f.name));
          request = { method: "POST", headers: { Accept: "application/json" }, body };
        } else {
          request = { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) };
        }
        const res = await fetch("/api/inquiries", request);
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          form.reset();
          show(onSuccess ? onSuccess(data, body) : "Thank you — we've received your message and will be in touch shortly.", true);
        } else if (res.status === 400 || res.status === 413 || res.status === 429) {
          Object.keys(body.fields || {}).forEach((f) => form.elements[f] && form.elements[f].classList.add("is-invalid"));
          const msg = res.status === 413 ? "Those photos are too large. Please send fewer or smaller photos." : Object.values(body.fields || {})[0] || body.error;
          show(esc(msg || "Please check the form and try again."), false);
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
    syncListButtons();
    renderCompareTray();
    initReveal();
    initVideos();
  });

  window.DCD = {
    SITE, ICONS, esc, money, km, params, monthlyPayment, loanFromPayment, loadInventory, carCard, renderCards,
    priceHtml, lists, toast, syncListButtons, initReveal, initInquiryForm, waHref, telHref, COMPARE_MAX,
  };
})();
