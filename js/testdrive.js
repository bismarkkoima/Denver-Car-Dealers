/* Test drive page: vehicle picker with live preview, date limits, location toggle. */
document.addEventListener("DOMContentLoaded", async () => {
  const { loadInventory, esc, money, initInquiryForm } = window.DCD;
  const form = document.querySelector("[data-testdrive-form]");
  const select = form.querySelector("[data-vehicle-select]");
  const preview = form.querySelector("[data-preview]");
  const caption = form.querySelector("[data-preview-caption]");
  const other = form.querySelector("[data-other]");
  const addressField = form.querySelector("[data-address]");

  // No dates in the past
  const date = form.querySelector("[data-min-today]");
  const today = new Date();
  date.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const cars = (await loadInventory()).filter((c) => c.status === "available");
  select.insertAdjacentHTML("beforeend", cars.map((c) =>
    `<option value="${esc(c.slug)}">${esc(c.title)}</option>`).join(""));

  function showVehicle() {
    const car = cars.find((c) => c.slug === select.value);
    preview.querySelector("img")?.remove();
    other.hidden = !!car;
    caption.hidden = !car;
    if (car && car.images[0]) {
      const img = new Image();
      img.src = car.images[0];
      img.alt = car.title;
      preview.prepend(img);
      caption.textContent = `${car.title} · ${money(car.price)}`;
    }
  }
  select.addEventListener("change", showVehicle);
  select.value = new URLSearchParams(location.search).get("vehicle") || "";
  if (!cars.some((c) => c.slug === select.value)) select.value = "";
  showVehicle();

  form.addEventListener("change", (e) => {
    if (e.target.name === "location") {
      const away = e.target.value !== "Showroom";
      addressField.hidden = !away;
      addressField.querySelector("input").required = away;
    }
  });

  initInquiryForm(form, {
    kind: "test_drive",
    extra: () => {
      const f = form.elements;
      const car = cars.find((c) => c.slug === select.value);
      return {
        name: `${f.first_name.value} ${f.last_name.value}`.trim(),
        first_name: undefined,
        last_name: undefined,
        subject: car ? `Test drive: ${car.title}` : "Test drive request",
      };
    },
    onSuccess: (data) => {
      setTimeout(() => { showVehicle(); addressField.hidden = true; addressField.querySelector("input").required = false; });
      return `Thank you, ${esc(data.name.split(" ")[0])}! Your test drive request for ${esc(data.preferred_date)} is in. We'll call you to confirm the time.`;
    },
  });
});
