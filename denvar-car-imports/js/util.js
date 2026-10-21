const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// Escape text before putting it into an HTML template string. Stock data will
// come from a JSON file or CMS later, so never trust it to be markup-safe.
export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}
