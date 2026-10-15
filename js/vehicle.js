/* Vehicle detail page: vehicle.html?id=<slug> */
document.addEventListener("DOMContentLoaded", async () => {
  const { loadInventory, renderCards, carouselHtml, initCarousels, priceHtml, esc, money, km, monthlyPayment, SITE, ICONS, waHref, toast, syncListButtons, initInquiryForm, initReveal } = window.DCD;
  const root = document.querySelector("[data-vehicle]");
  const id = new URLSearchParams(location.search).get("id");
  const cars = await loadInventory();
  const v = cars.find((c) => c.slug === id || String(c.id) === id);

  if (!v) {
    root.innerHTML = `
      <div class="empty-state">
        <h1 class="display display--md">Vehicle not found</h1>
        <p>This car may have been sold or the link is out of date.</p>
        <a class="btn" href="vehicles.html">Browse inventory</a>
      </div>`;
    return;
  }

  document.title = `${v.title} — Denver Car Dealership`;
  const { rate, depositPct, months } = SITE.finance;
  const monthly = monthlyPayment(v.price * (1 - depositPct / 100), rate, months);
  const sold = v.status === "sold";
  const specs = [
    ["Year", v.year], ["Mileage", km(v.mileage)], ["Body type", v.body_type], ["Condition", v.condition],
    ["Transmission", v.transmission], ["Fuel", v.fuel],
    ["Engine", v.engine_cc ? `${Number(v.engine_cc).toLocaleString()} cc` : ""], ["Drivetrain", v.drivetrain],
    ["Exterior", v.exterior_color], ["Interior", v.interior_color],
  ].filter(([, val]) => val);

  root.innerHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="vehicles.html">Vehicles</a> / ${esc(v.make)} / ${esc(v.model)}</nav>
    <div class="vd">
      <div>
        <div class="gallery">
          ${v.images.length ? carouselHtml(v.images, { alt: v.title, variant: "detail" }) : '<div class="carousel--detail"></div>'}
          ${v.images.length ? `<button type="button" class="glass glass--icon gallery__expand" data-expand aria-label="View photos full screen">${ICONS.expand}</button>` : ""}
          ${v.images.length > 1 ? `<div class="gallery__thumbs">${v.images.map((src, i) =>
            `<button type="button" data-index="${i}" aria-label="Show photo ${i + 1}" aria-current="${i === 0}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
        </div>

        ${v.description ? `<div class="vd__block"><h2 class="display display--sm">Overview</h2><p class="lead">${esc(v.description)}</p></div>` : ""}
        ${v.features.length ? `<div class="vd__block"><h2 class="display display--sm">Highlights</h2>
          <ul class="feature-list">${v.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>` : ""}
      </div>

      <aside class="vd__aside">
        <span class="vd__status vd__status--${esc(v.status)}">${esc(v.status)}</span>
        <div>
          <p class="eyebrow muted">${esc(v.year)} · ${esc(v.trim || v.body_type)}</p>
          <h1 class="display display--md" style="margin-top: 10px">${esc(v.make)} ${esc(v.model)}</h1>
        </div>
        <p class="vd__price">${priceHtml(v)}</p>
        ${v.on_offer ? `<p class="vd__offer">Offer: save ${money(v.was_price - v.price)}</p>` : ""}
        ${sold ? "" : `<p class="vd__monthly">From approx. <strong>${money(monthly)}/mo</strong> with ${depositPct}% deposit · <a href="financing.html?vehicle=${encodeURIComponent(v.slug)}#calculator">Customise</a></p>`}
        <div class="vd__actions">
          ${sold
            ? `<a class="btn" href="vehicles.html?body=${encodeURIComponent(v.body_type)}">See similar ${esc(v.body_type)}s</a>`
            : `<a class="btn" href="testdrive.html?vehicle=${encodeURIComponent(v.slug)}">Book a test drive</a>
               <a class="btn btn--ghost" href="financing.html?vehicle=${encodeURIComponent(v.slug)}#apply">Apply for financing</a>`}
          <a class="btn btn--ghost" href="${waHref(`Hi, I'm interested in the ${v.title} (${location.href}).`)}" target="_blank" rel="noopener">WhatsApp about this car</a>
        </div>
        <div class="vd__tools">
          <button type="button" class="tool-btn" data-save="${esc(v.slug)}" data-label aria-pressed="false">${ICONS.heart}<span>Save</span></button>
          <button type="button" class="tool-btn" data-compare="${esc(v.slug)}" data-label aria-pressed="false">${ICONS.compare}<span>Compare</span></button>
          <button type="button" class="tool-btn" data-share>${ICONS.share}<span>Share</span></button>
        </div>
        <dl class="spec-grid">${specs.map(([k, val]) => `<div><dt>${k}</dt><dd>${esc(val)}</dd></div>`).join("")}</dl>
      </aside>
    </div>`;

  syncListButtons();

  // Share: native share sheet on phones, copy link elsewhere
  root.querySelector("[data-share]").addEventListener("click", async () => {
    const shareData = { title: v.title, text: `${v.title} at ${SITE.name}`, url: location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (_) { /* cancelled */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(location.href);
      toast("Link copied to clipboard");
    } catch (_) {
      toast(`Copy this link: ${esc(location.href)}`);
    }
  });

  // Structured data so search engines can show price and photos
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Car",
    name: v.title,
    brand: { "@type": "Brand", name: v.make },
    model: v.model,
    vehicleModelDate: String(v.year),
    bodyType: v.body_type,
    fuelType: v.fuel,
    vehicleTransmission: v.transmission,
    color: v.exterior_color || undefined,
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.mileage, unitCode: "KMT" },
    itemCondition: v.condition === "New" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    description: v.description || undefined,
    image: v.images.map((src) => new URL(src, location.href).href),
    url: location.href,
    offers: {
      "@type": "Offer",
      price: v.price,
      priceCurrency: "KES",
      availability: v.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      seller: { "@type": "AutoDealer", name: SITE.name },
    },
  }).replace(/</g, "\\u003c");
  document.head.appendChild(ld);

  // Gallery: swipe carousel, synced thumbnails and a full-screen viewer
  const gallery = root.querySelector(".gallery");
  const main = gallery.querySelector("[data-carousel]");
  initCarousels(gallery);
  const thumbs = gallery.querySelectorAll("[data-index]");
  if (main) {
    main.addEventListener("carousel:change", (e) => {
      thumbs.forEach((t, n) => t.setAttribute("aria-current", n === e.detail.index));
      thumbs[e.detail.index]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    });
    thumbs.forEach((t) => t.addEventListener("click", () => main.goTo(Number(t.dataset.index))));
    gallery.querySelector("[data-expand]").addEventListener("click", () => openLightbox(currentIndex()));
    main.querySelector(".carousel__track").addEventListener("dblclick", () => openLightbox(currentIndex()));
  }
  function currentIndex() {
    const track = main.querySelector(".carousel__track");
    return Math.round(track.scrollLeft / (track.clientWidth || 1));
  }
  function openLightbox(index) {
    const dialog = document.createElement("dialog");
    dialog.className = "lightbox";
    dialog.setAttribute("aria-label", `${v.title} photos`);
    dialog.innerHTML = `
      <p class="lightbox__title">${esc(v.title)}</p>
      <button type="button" class="glass glass--icon lightbox__close" aria-label="Close photos">${ICONS.close}</button>
      ${carouselHtml(v.images, { alt: v.title, variant: "lightbox", start: index })}`;
    document.body.appendChild(dialog);
    document.body.classList.add("lightbox-open");
    dialog.showModal();
    initCarousels(dialog);
    const lb = dialog.querySelector("[data-carousel]");
    let at = index;
    lb.addEventListener("carousel:change", (e) => { at = e.detail.index; });
    lb.querySelector(".carousel__track").focus({ preventScroll: true });
    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); lb.goTo(at + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); lb.goTo(at - 1); }
    });
    dialog.querySelector(".lightbox__close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
      main.goTo(at, false);
      document.body.classList.remove("lightbox-open");
      dialog.remove();
      gallery.querySelector("[data-expand]").focus({ preventScroll: true });
    });
  }


  // Enquiry form
  const section = document.querySelector("[data-enquire]");
  const form = section.querySelector("form");
  section.hidden = false;
  form.elements.message.placeholder = `Hi, I'm interested in the ${v.title}. Is it still available?`;
  initInquiryForm(form, {
    kind: "contact",
    extra: () => ({ vehicle: v.slug, subject: `Inquiry: ${v.title}` }),
    onSuccess: () => `Thanks! We've received your inquiry about the ${esc(v.title)} and will contact you shortly.`,
  });

  // Similar vehicles
  const similar = cars
    .filter((c) => c.slug !== v.slug && c.status !== "sold")
    .map((c) => ({ c, score: (c.body_type === v.body_type ? 2 : 0) + (c.make === v.make ? 1 : 0) - Math.abs(c.price - v.price) / 1e8 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ c }) => c);
  if (similar.length) {
    document.querySelector("[data-similar]").hidden = false;
    renderCards(document.querySelector("[data-similar-grid]"), similar, { cta: "View details" });
  }
  initReveal();
});
