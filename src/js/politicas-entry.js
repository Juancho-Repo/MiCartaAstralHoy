import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/reservar.css';
import '../styles/politicas.css';

// Set footer year
const el = document.querySelector('[data-year]');
if (el) el.textContent = String(new Date().getFullYear());
