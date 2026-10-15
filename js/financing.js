/* Financing page: payment calculator and credit application. */
document.addEventListener("DOMContentLoaded", async () => {
  const { loadInventory, esc, money, monthlyPayment, initInquiryForm, SITE } = window.DCD;
  const calc = document.querySelector("[data-calc]");
  const out = (key, text) => { calc.querySelector(`[data-out="${key}"]`).textContent = text; };
  const vehicleSelect = calc.querySelector("[data-calc-vehicle]");
  const applySelect = document.querySelector("[data-apply-vehicle]");
  const applyForm = document.querySelector("[data-finance-form]");

  calc.elements.rate.value = SITE.finance.rate;
  calc.elements.deposit.value = SITE.finance.depositPct;
  calc.elements.months.value = SITE.finance.months;

  function update() {
    const price = Number(calc.elements.price.value);
    const depositPct = Number(calc.elements.deposit.value);
    const months = Number(calc.elements.months.value);
    const rate = Number(calc.elements.rate.value);
    const deposit = price * (depositPct / 100);
    const loan = price - deposit;
    const monthly = monthlyPayment(loan, rate, months);
    const interest = monthly * months - loan;

    out("price", money(price));
    out("deposit", `${depositPct}% · ${money(deposit)}`);
    out("months", `${months} months`);
    out("rate", `${rate}%`);
    out("monthly", money(monthly));
    out("depositAmt", money(deposit));
    out("loan", money(loan));
    out("interest", money(interest));
    out("total", money(price + interest));
    applyForm.elements.deposit.placeholder = `e.g. ${money(deposit)}`;
  }

  calc.addEventListener("input", (e) => {
    if (e.target.name === "price") vehicleSelect.value = "";
    update();
  });

  const cars = (await loadInventory()).filter((c) => c.status !== "sold");
  const options = cars.map((c) => `<option value="${esc(c.slug)}">${esc(c.title)} — ${money(c.price)}</option>`).join("");
  vehicleSelect.insertAdjacentHTML("beforeend", options);
  applySelect.insertAdjacentHTML("beforeend", options);

  const pickVehicle = (slug) => {
    const car = cars.find((c) => c.slug === slug);
    if (!car) return;
    const price = calc.elements.price;
    price.max = Math.max(Number(price.max), car.price);
    price.value = car.price;
    vehicleSelect.value = slug;
    applySelect.value = slug;
  };
  vehicleSelect.addEventListener("change", () => { pickVehicle(vehicleSelect.value); update(); });

  calc.querySelector("[data-calc-apply]").addEventListener("click", () => {
    applySelect.value = vehicleSelect.value;
    applyForm.elements.deposit.value = money(Number(calc.elements.price.value) * Number(calc.elements.deposit.value) / 100);
    applyForm.elements.term.value = `${calc.elements.months.value} months`;
  });

  pickVehicle(new URLSearchParams(location.search).get("vehicle"));
  update();

  initInquiryForm(applyForm, {
    kind: "finance",
    extra: () => ({ subject: "Finance application" }),
    onSuccess: () => "Application received. A finance specialist will call you within one business day.",
  });
});
