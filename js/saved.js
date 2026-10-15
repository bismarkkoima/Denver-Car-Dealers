/* Saved vehicles page (stored in this browser). */
document.addEventListener("DOMContentLoaded", async () => {
  const { loadInventory, lists, renderCards, COMPARE_MAX, toast } = window.DCD;
  const grid = document.querySelector("[data-saved-grid]");
  const empty = document.querySelector("[data-saved-empty]");
  const actions = document.querySelector("[data-saved-actions]");
  const summary = document.querySelector("[data-saved-summary]");
  const cars = await loadInventory();

  function render() {
    const saved = lists.read("saved").map((s) => cars.find((c) => c.slug === s)).filter(Boolean);
    renderCards(grid, saved, { cta: "View details" });
    grid.hidden = !saved.length;
    empty.hidden = !!saved.length;
    actions.hidden = !saved.length;
    summary.textContent = saved.length
      ? `${saved.length} vehicle${saved.length === 1 ? "" : "s"} saved on this device.`
      : "Cars you save are kept on this device.";
  }

  document.querySelector("[data-clear-saved]").addEventListener("click", () => lists.write("saved", []));
  document.querySelector("[data-compare-saved]").addEventListener("click", () => {
    const ids = lists.read("saved").filter((s) => cars.some((c) => c.slug === s)).slice(0, COMPARE_MAX);
    lists.write("compare", ids);
    if (lists.read("saved").length > COMPARE_MAX) toast(`Comparing your first ${COMPARE_MAX} saved vehicles.`);
    location.href = "compare.html";
  });
  document.addEventListener("dcd:lists", render);
  render();
});
