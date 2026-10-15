/* Sell / trade-in page: four-step wizard with photo upload. */
document.addEventListener("DOMContentLoaded", async () => {
  const { loadInventory, esc, money, initInquiryForm, toast } = window.DCD;
  const form = document.querySelector("[data-sell-form]");
  const steps = [...form.querySelectorAll("[data-step]")];
  const progress = [...form.querySelectorAll("[data-progress] li")];
  const back = form.querySelector("[data-back]");
  const next = form.querySelector("[data-next]");
  const submit = form.querySelector("[data-submit]");
  const input = form.querySelector("[data-photo-input]");
  const dropzone = form.querySelector("[data-dropzone]");
  const previews = form.querySelector("[data-previews]");
  const MAX_PHOTOS = 8;
  let current = 0;
  let photos = []; // { file, url }

  /* ---------------------------------------------------------- steps */
  function show(i, scroll = true) {
    current = i;
    steps.forEach((s, n) => { s.hidden = n !== i; });
    progress.forEach((p, n) => {
      p.classList.toggle("is-done", n < i);
      if (n === i) p.setAttribute("aria-current", "step"); else p.removeAttribute("aria-current");
    });
    back.hidden = i === 0;
    next.hidden = i === steps.length - 1;
    submit.hidden = i !== steps.length - 1;
    if (scroll) form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function stepValid(i) {
    const fields = [...steps[i].querySelectorAll("input, select, textarea")];
    const bad = fields.find((f) => !f.checkValidity());
    fields.forEach((f) => f.classList.remove("is-invalid"));
    if (!bad) return true;
    bad.classList.add("is-invalid");
    bad.focus();
    bad.reportValidity();
    return false;
  }

  next.addEventListener("click", () => {
    if (!stepValid(current)) return;
    if (steps[current].contains(input) && !photos.length) {
      toast("Tip: photos help us make a firm offer. You can continue without them.");
    }
    show(current + 1);
  });
  back.addEventListener("click", () => show(current - 1));

  /* --------------------------------------------------------- photos */
  /** Shrink big phone photos before upload (faster on mobile data). */
  function shrink(file, maxSide = 1600) {
    return new Promise((resolve) => {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return resolve(null);
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        if (scale === 1 && file.size < 1.5e6) { URL.revokeObjectURL(url); return resolve(file); }
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => resolve(blob ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file), "image/jpeg", 0.85);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  async function addFiles(fileList) {
    const incoming = [...fileList];
    const room = MAX_PHOTOS - photos.length;
    if (incoming.length > room) toast(`You can add up to ${MAX_PHOTOS} photos.`);
    let skipped = 0;
    for (const f of incoming.slice(0, Math.max(room, 0))) {
      const small = await shrink(f);
      if (!small) { skipped++; continue; }
      photos.push({ file: small, url: URL.createObjectURL(small) });
    }
    if (skipped) toast("Some files were skipped. Please use JPG, PNG or WEBP photos.");
    renderPreviews();
  }

  function renderPreviews() {
    previews.innerHTML = photos.map((p, i) => `
      <figure>
        <img src="${p.url}" alt="Photo ${i + 1}">
        <button type="button" data-remove="${i}" aria-label="Remove photo ${i + 1}">×</button>
        ${i === 0 ? "<figcaption>Cover</figcaption>" : ""}
      </figure>`).join("");
    dropzone.querySelector("strong").textContent = photos.length ? `${photos.length} of ${MAX_PHOTOS} photos · add more` : "Add photos";
  }

  input.addEventListener("change", () => { addFiles(input.files); input.value = ""; });
  previews.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    const [removed] = photos.splice(Number(btn.dataset.remove), 1);
    URL.revokeObjectURL(removed.url);
    renderPreviews();
  });
  ["dragenter", "dragover"].forEach((t) => dropzone.addEventListener(t, (e) => { e.preventDefault(); dropzone.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach((t) => dropzone.addEventListener(t, (e) => { e.preventDefault(); dropzone.classList.remove("is-over"); }));
  dropzone.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));

  /* ---------------------------------------------- trade-in towards */
  const tradeFor = form.querySelector("[data-trade-for]");
  const select = form.querySelector("[data-vehicle-select]");
  form.addEventListener("change", (e) => {
    if (e.target.name === "intent") tradeFor.hidden = e.target.value !== "Trade in";
  });
  const cars = (await loadInventory()).filter((c) => c.status === "available");
  select.insertAdjacentHTML("beforeend", cars.map((c) =>
    `<option value="${esc(c.slug)}">${esc(c.title)} — ${money(c.price)}</option>`).join(""));

  /* --------------------------------------------------------- submit */
  initInquiryForm(form, {
    kind: "sell",
    files: () => photos.map((p) => p.file),
    extra: () => {
      const f = form.elements;
      return { subject: `Offer request: ${f.year.value} ${f.make.value} ${f.model.value}`.trim() };
    },
    onSuccess: (data) => {
      photos.forEach((p) => URL.revokeObjectURL(p.url));
      photos = [];
      setTimeout(() => { renderPreviews(); show(0); tradeFor.hidden = true; });
      return `Thank you, ${esc((data.name || "").split(" ")[0])}! We've received the details of your ${esc(data.make)} ${esc(data.model)} and will call you with an offer, usually within one business day.`;
    },
  });

  show(0, false);
});
