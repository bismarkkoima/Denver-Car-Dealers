/* Service booking page. */
document.addEventListener("DOMContentLoaded", () => {
  const { initInquiryForm, toast, esc } = window.DCD;
  const form = document.querySelector("[data-service-form]");
  const date = form.querySelector("[data-min-today]");
  const today = new Date();
  date.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const chosen = () => [...form.querySelectorAll('input[name="svc"]:checked')].map((i) => i.value);

  initInquiryForm(form, {
    kind: "service",
    beforeSubmit: () => {
      if (chosen().length) return true;
      toast("Please choose at least one service.");
      form.querySelector("[data-services]").scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    },
    extra: () => ({
      services: chosen().join(", "),
      svc: undefined,
      subject: `Service: ${form.elements.make.value} ${form.elements.model.value}`.trim(),
    }),
    onSuccess: (data) =>
      `Thanks, ${esc((data.name || "").split(" ")[0])}! Your service request for ${esc(data.preferred_date)} is in. We'll call to confirm the time.`,
  });
});
