// Static demo of the enquiry form (no backend until Phase 19).
export function initContactForm() {
  const form = document.querySelector('.form-card');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let note = form.querySelector('.form-note');
    if (!note) {
      note = document.createElement('p');
      note.className = 'form-note show';
      note.setAttribute('role', 'status');
      note.textContent = "Thanks — we'll reply on WhatsApp or email within 48 hours.";
      form.appendChild(note);
    }
    form.reset();
  });
}
