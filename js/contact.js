/* Contact page: prefill the subject from ?subject=Trade-in links. */
document.addEventListener("DOMContentLoaded", () => {
  const { initInquiryForm, params } = window.DCD;
  const form = document.querySelector("[data-contact-form]");
  const wanted = params().get("subject");
  if (wanted) {
    const match = [...form.elements.subject.options].find((o) => o.value.toLowerCase() === wanted.toLowerCase());
    if (match) form.elements.subject.value = match.value;
    if (/trade/i.test(wanted)) form.elements.message.placeholder = "Tell us the make, model, year and mileage of the car you'd like to trade in…";
    if (/sourc/i.test(wanted)) form.elements.message.placeholder = "Which make and model are you after? What's your budget and timeline?";
  }
  initInquiryForm(form, { kind: "contact" });
});
