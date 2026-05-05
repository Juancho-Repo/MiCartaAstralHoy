// Utilidades de sanitizacion. No hay formularios todavia pero se preparan para el futuro.
// Regla: nunca usar innerHTML con datos externos; usar textContent o estas helpers.

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(input = '') {
  return String(input).replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

export function isEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
}

export function trimField(value = '', max = 500) {
  return String(value).trim().slice(0, max);
}
