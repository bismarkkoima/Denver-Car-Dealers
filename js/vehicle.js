/* Vehicle detail page: vehicle.html?id=<slug> */
document.addEventListener("DOMContentLoaded", async () => {
  const { loadInventory, carCard, esc, money, km, monthlyPayment, SITE, waHref, initInquiryForm, initReveal } = window.DCD;
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
          <div class="gallery__main">
            ${v.images.length ? `<img data-main src="${esc(v.images[0])}" alt="${esc(v.title)}">` : ""}
            ${v.images.length > 1 ? `
              <button class="gallery__nav gallery__nav--prev" type="button" data-step="-1" aria-label="Previous photo">←</button>
              <button class="gallery__nav gallery__nav--next" type="button" data-step="1" aria-label="Next photo">→</button>
              <span class="gallery__count" data-count>1 / ${v.images.length}</span>` : ""}
          </div>
          ${v.images.length > 1 ? `<div class="gallery__thumbs">${v.images.map((src, i) =>
            `<button type="button" data-index="${i}" aria-label="Photo ${i + 1}" aria-current="${i === 0}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
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
        <p class="vd__price">${sold ? "Sold" : money(v.price)}</p>
        ${sold ? "" : `<p class="vd__monthly">From approx. <strong>${money(monthly)}/mo</strong> with ${depositPct}% deposit · <a href="financing.html?vehicle=${encodeURIComponent(v.slug)}#calculator">Customise</a></p>`}
        <div class="vd__actions">
          ${sold
            ? `<a class="btn" href="vehicles.html?body=${encodeURIComponent(v.body_type)}">See similar ${esc(v.body_type)}s</a>`
            : `<a class="btn" href="testdrive.html?vehicle=${encodeURIComponent(v.slug)}">Book a test drive</a>
               <a class="btn btn--ghost" href="financing.html?vehicle=${encodeURIComponent(v.slug)}#apply">Apply for financing</a>`}
          <a class="btn btn--ghost" href="${waHref(`Hi, I'm interested in the ${v.title} (${location.href}).`)}" target="_blank" rel="noopener">WhatsApp about this car</a>
        </div>
        <dl class="spec-grid">${specs.map(([k, val]) => `<div><dt>${k}</dt><dd>${esc(val)}</dd></div>`).join("")}</dl>
      </aside>
    </div>`;

  // Gallery
  if (v.images.length > 1) {
    let current = 0;
    const main = root.querySelector("[data-main]");
    const counter = root.querySelector("[data-count]");
    const thumbs = root.querySelectorAll("[data-index]");
    const go = (i) => {
      current = (i + v.images.length) % v.images.length;
      main.src = v.images[current];
      counter.textContent = `${current + 1} / ${v.images.length}`;
      thumbs.forEach((t, n) => t.setAttribute("aria-current", n === current));
    };
    root.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => go(current + Number(b.dataset.step))));
    thumbs.forEach((t) => t.addEventListener("click", () => go(Number(t.dataset.index))));
    document.addEventListener("keydown", (e) => {
      if (e.target.closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") go(current + 1);
      if (e.key === "ArrowLeft") go(current - 1);
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
    document.querySelector("[data-similar-grid]").innerHTML = similar.map((c) => carCard(c, { cta: "View details" })).join("");
  }
  initReveal();
});
