/* Inventory page: filters, sorting and URL-synced state (?body=SUV&make=Toyota). */
document.addEventListener("DOMContentLoaded", async () => {
  const { loadInventory, renderCards, esc } = window.DCD;
  const form = document.querySelector("[data-filters]");
  const sort = document.querySelector("[data-sort]");
  const grid = document.querySelector("[data-grid]");
  const empty = document.querySelector("[data-empty]");
  const count = document.querySelector("[data-count]");
  const cars = await loadInventory();

  const fill = (name, values) => {
    const select = form.elements[name];
    select.insertAdjacentHTML("beforeend", values.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join(""));
  };
  const uniq = (key) => [...new Set(cars.map((c) => c[key]).filter(Boolean))].sort();
  fill("make", uniq("make"));
  fill("body", uniq("body_type"));
  fill("fuel", uniq("fuel"));

  // Restore state from the URL
  const url = new URLSearchParams(location.search);
  const maxSelect = form.elements.max;
  if (url.get("max") && ![...maxSelect.options].some((o) => o.value === url.get("max")) && Number(url.get("max")) > 0) {
    maxSelect.add(new Option(`Up to ${window.DCD.money(url.get("max"))}`, url.get("max")));
  }
  ["q", "make", "body", "fuel", "max"].forEach((k) => { if (url.get(k)) form.elements[k].value = url.get(k); });
  form.elements.offers.checked = url.get("offers") === "1";
  if (url.get("sort")) sort.value = url.get("sort");
  let condition = url.get("condition") || "";

  const sorters = {
    featured: (a, b) => (a.status === "sold") - (b.status === "sold") || b.featured - a.featured || b.year - a.year,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "year-desc": (a, b) => b.year - a.year,
    "mileage-asc": (a, b) => a.mileage - b.mileage,
  };

  function render() {
    const f = Object.fromEntries(new FormData(form).entries());
    const q = (f.q || "").trim().toLowerCase();
    const list = cars
      .filter((c) => !q || `${c.year} ${c.make} ${c.model} ${c.trim || ""}`.toLowerCase().includes(q))
      .filter((c) => !f.make || c.make === f.make)
      .filter((c) => !f.body || c.body_type === f.body)
      .filter((c) => !f.fuel || c.fuel === f.fuel)
      .filter((c) => !f.max || c.price <= Number(f.max))
      .filter((c) => !condition || c.condition === condition)
      .filter((c) => !f.offers || c.on_offer)
      .sort(sorters[sort.value] || sorters.featured);

    renderCards(grid, list, { cta: "View details" });
    grid.hidden = !list.length;
    empty.hidden = !!list.length;
    count.textContent = `${list.length} vehicle${list.length === 1 ? "" : "s"}${condition ? ` · ${condition}` : ""}${f.offers ? " · On offer" : ""}`;

    const next = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => v && next.set(k, v));
    if (condition) next.set("condition", condition);
    if (sort.value !== "featured") next.set("sort", sort.value);
    history.replaceState(null, "", next.toString() ? `?${next}` : location.pathname);
  }

  form.addEventListener("input", render);
  form.addEventListener("submit", (e) => { e.preventDefault(); render(); });
  form.addEventListener("reset", () => { condition = ""; setTimeout(render); });
  sort.addEventListener("change", render);
  document.querySelector("[data-clear]").addEventListener("click", () => form.reset());
  render();
});
