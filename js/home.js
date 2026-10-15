/* Home page: lineup rail with body-type tabs. */
document.addEventListener("DOMContentLoaded", async () => {
  const { loadInventory, renderCards, esc } = window.DCD;
  const rail = document.querySelector("[data-lineup]");
  const tabs = document.querySelector("[data-lineup-tabs]");
  const cars = (await loadInventory()).filter((c) => c.status !== "sold");

  const bodies = [...new Set(cars.map((c) => c.body_type))];
  tabs.insertAdjacentHTML("beforeend", bodies.map((b) =>
    `<button class="tab" role="tab" aria-selected="false" data-body="${esc(b)}">${esc(b)}s</button>`).join(""));

  const show = (body) => {
    const list = cars.filter((c) => !body || c.body_type === body).sort((a, b) => b.featured - a.featured);
    if (list.length) renderCards(rail, list, { cta: "Explore", specs: false });
    else rail.innerHTML = '<p class="muted">New stock arriving soon. Check back shortly.</p>';
    rail.scrollTo({ left: 0 });
  };

  tabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    tabs.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-selected", t === tab));
    show(tab.dataset.body);
  });

  document.querySelectorAll("[data-rail]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const step = rail.firstElementChild ? rail.firstElementChild.getBoundingClientRect().width + 24 : 300;
      rail.scrollBy({ left: btn.dataset.rail === "next" ? step : -step, behavior: "smooth" });
    })
  );

  show("");

  // Current offers
  const offers = cars.filter((c) => c.on_offer).sort((a, b) => (b.was_price - b.price) - (a.was_price - a.price)).slice(0, 3);
  if (offers.length) {
    document.querySelector("[data-offers]").hidden = false;
    renderCards(document.querySelector("[data-offers-grid]"), offers, { cta: "View offer" });
  }
});
