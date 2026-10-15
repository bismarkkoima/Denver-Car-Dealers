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
    extra: () => ({ subject: "Finance application", prequalified_budget: applyForm.dataset.prequalBudget }),
    onSuccess: () => "Application received. A finance specialist will call you within one business day.",
  });
});

/* Pre-qualification: five questions -> estimated budget and matching cars. */
document.addEventListener("DOMContentLoaded", async () => {
  const { loadInventory, renderCards, money, loanFromPayment, SITE, initReveal } = window.DCD;
  const AFFORDABILITY = 0.35; // share of net income lenders typically allow for all loan repayments
  const root = document.querySelector("[data-prequal]");
  const form = root.querySelector("[data-prequal-form]");
  const questions = [...form.querySelectorAll("[data-q]")];
  const bar = root.querySelector("[data-prequal-bar]");
  const back = form.querySelector("[data-pq-back]");
  const next = form.querySelector("[data-pq-next]");
  const result = root.querySelector("[data-prequal-result]");
  const matchesWrap = document.querySelector("[data-pq-matches-wrap]");
  const applyForm = document.querySelector("[data-finance-form]");
  const out = (k, v) => { root.querySelector(`[data-pq-${k}]`).textContent = v; };
  let step = 0;
  let budget = null;

  function show(i) {
    step = i;
    questions.forEach((q, n) => { q.hidden = n !== i; });
    back.hidden = i === 0;
    next.textContent = i === questions.length - 1 ? "See my budget" : "Next";
    bar.style.width = `${((i + 1) / (questions.length + 1)) * 100}%`;
    const field = questions[i].querySelector("input:not([type=radio])");
    if (field && i > 0) field.focus({ preventScroll: true });
  }

  function incomeBand(income) {
    if (income < 100000) return "Below KSh 100,000";
    if (income < 250000) return "KSh 100,000 – 250,000";
    if (income <= 500000) return "KSh 250,000 – 500,000";
    return "Above KSh 500,000";
  }

  async function finish() {
    const f = form.elements;
    const income = Number(f.income.value);
    const debts = Number(f.debts.value) || 0;
    const deposit = Number(f.deposit.value) || 0;
    const term = Number(form.querySelector('input[name="term"]:checked').value);
    const monthly = Math.max(0, income * AFFORDABILITY - debts);
    const loan = loanFromPayment(monthly, SITE.finance.rate, term);
    budget = Math.round((loan + deposit) / 10000) * 10000;

    out("budget", budget > 0 ? `Up to ${money(budget)}` : "Let's talk");
    out("monthly", money(monthly));
    out("loan", money(loan));
    out("deposit", money(deposit));
    out("term", `${term} months · ~${SITE.finance.rate}% p.a.`);
    out("note", monthly > 0
      ? `Estimate based on repayments of up to ${AFFORDABILITY * 100}% of take-home pay, minus existing loans. Your final amount depends on the lender's checks.`
      : "Your current repayments use most of your income. A finance specialist can still look at options such as a larger deposit or a longer term.");
    form.hidden = true;
    result.hidden = false;
    bar.style.width = "100%";

    // Pre-fill the application form below
    applyForm.elements.monthly_income.value = incomeBand(income);
    applyForm.elements.employment.value = form.querySelector('input[name="employment"]:checked').value;
    applyForm.elements.deposit.value = money(deposit);
    applyForm.elements.term.value = `${term} months`;
    applyForm.dataset.prequalBudget = money(budget);

    const cars = (await loadInventory())
      .filter((c) => c.status === "available" && c.price <= budget)
      .sort((a, b) => b.price - a.price)
      .slice(0, 3);
    matchesWrap.hidden = !cars.length;
    if (cars.length) {
      renderCards(matchesWrap.querySelector("[data-pq-matches]"), cars, { cta: "View details" });
      matchesWrap.querySelector("[data-pq-all]").href = `vehicles.html?max=${budget}`;
      initReveal();
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = [...questions[step].querySelectorAll("input")];
    const bad = fields.find((x) => !x.checkValidity());
    if (bad) { bad.reportValidity(); return; }
    if (step < questions.length - 1) show(step + 1);
    else finish();
  });
  back.addEventListener("click", () => show(step - 1));
  root.querySelector("[data-pq-restart]").addEventListener("click", () => {
    form.reset();
    form.hidden = false;
    result.hidden = true;
    matchesWrap.hidden = true;
    delete applyForm.dataset.prequalBudget;
    show(0);
  });
  show(0);
});
