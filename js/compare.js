/* Compare page: up to three vehicles side by side. ?ids=a,b,c also works for shared links. */
document.addEventListener("DOMContentLoaded", async () => {
  const { loadInventory, lists, esc, money, km, priceHtml, monthlyPayment, SITE, COMPARE_MAX, ICONS } = window.DCD;
  const root = document.querySelector("[data-compare-root]");
  const diffToggle = document.querySelector("[data-diff]");
  const cars = await loadInventory();

  // A shared link (?ids=) seeds this browser's compare list
  const shared = new URLSearchParams(location.search).get("ids");
  if (shared) {
    const ids = shared.split(",").filter((s) => cars.some((c) => c.slug === s)).slice(0, COMPARE_MAX);
    if (ids.length) lists.write("compare", ids);
  }

  const { rate, depositPct, months } = SITE.finance;
  const ROWS = [
    ["Price", (v) => priceHtml(v)],
    ["Est. monthly", (v) => v.status === "sold" ? "—" : `${money(monthlyPayment(v.price * (1 - depositPct / 100), rate, months))}/mo`],
    ["Year", (v) => esc(v.year)],
    ["Mileage", (v) => km(v.mileage)],
    ["Body type", (v) => esc(v.body_type)],
    ["Condition", (v) => esc(v.condition)],
    ["Transmission", (v) => esc(v.transmission)],
    ["Fuel", (v) => esc(v.fuel)],
    ["Engine", (v) => v.engine_cc ? `${Number(v.engine_cc).toLocaleString()} cc` : "—"],
    ["Drivetrain", (v) => esc(v.drivetrain || "—")],
    ["Exterior", (v) => esc(v.exterior_color || "—")],
    ["Interior", (v) => esc(v.interior_color || "—")],
    ["Status", (v) => `<span class="vd__status vd__status--${esc(v.status)}">${esc(v.status)}</span>`],
    ["Highlights", (v) => v.features.length ? `<ul class="compare-features">${v.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : "—"],
  ];

  function render() {
    const picked = lists.read("compare").map((s) => cars.find((c) => c.slug === s)).filter(Boolean);
    if (!picked.length) {
      root.innerHTML = `
        <div class="empty-state">
          <h2 class="display display--md">Nothing to compare yet</h2>
          <p>Tap the ${ICONS.compare.replace("<svg", '<svg class="inline-icon"')} compare button on any vehicle to add it here.</p>
          <a class="btn" href="vehicles.html">Browse vehicles</a>
        </div>`;
      return;
    }
    const options = cars.filter((c) => !picked.includes(c))
      .map((c) => `<option value="${esc(c.slug)}">${esc(c.title)}</option>`).join("");
    const empty = COMPARE_MAX - picked.length;
    const cols = picked.length + (empty ? 1 : 0);
    const onlyDiff = diffToggle.checked;

    const head = picked.map((v) => `
      <th scope="col">
        <div class="compare-car">
          <button type="button" class="compare-car__remove" data-compare="${esc(v.slug)}" aria-label="Remove ${esc(v.title)}">${ICONS.close}</button>
          <a href="vehicle.html?id=${encodeURIComponent(v.slug)}">${v.images[0] ? `<img src="${esc(v.images[0])}" alt="">` : ""}</a>
          <span class="eyebrow muted">${esc(v.year)}</span>
          <a class="compare-car__title" href="vehicle.html?id=${encodeURIComponent(v.slug)}">${esc(v.make)} ${esc(v.model)}</a>
          ${v.status === "sold" ? "" : `<a class="btn btn--ghost" href="testdrive.html?vehicle=${encodeURIComponent(v.slug)}">Test drive</a>`}
        </div>
      </th>`).join("") + (empty ? `
      <th scope="col">
        <div class="compare-car compare-car--add">
          <span class="eyebrow muted">Add a vehicle</span>
          <select data-add aria-label="Add a vehicle to compare"><option value="">Choose…</option>${options}</select>
        </div>
      </th>` : "");

    const body = ROWS.map(([label, fn]) => {
      const values = picked.map(fn);
      const same = values.every((x) => x === values[0]);
      if (onlyDiff && same && picked.length > 1) return "";
      return `<tr class="${same || picked.length < 2 ? "" : "is-diff"}"><th scope="row">${label}</th>${values.map((x) => `<td>${x}</td>`).join("")}${empty ? "<td></td>" : ""}</tr>`;
    }).join("");

    root.innerHTML = `
      <div class="compare-wrap">
        <table class="compare-table" style="--cols: ${cols}">
          <thead><tr><th class="compare-table__corner"><button type="button" class="link-btn" data-share-compare>Share comparison</button></th>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>`;

    root.querySelector("[data-add]")?.addEventListener("change", (e) => {
      if (e.target.value) lists.toggle("compare", e.target.value, COMPARE_MAX);
    });
    root.querySelector("[data-share-compare]").addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}?ids=${picked.map((v) => v.slug).join(",")}`;
      try { await navigator.clipboard.writeText(url); window.DCD.toast("Comparison link copied"); }
      catch (_) { window.DCD.toast(`Share this link: ${esc(url)}`); }
    });
  }

  document.addEventListener("dcd:lists", render);
  diffToggle.addEventListener("change", render);
  render();
});
