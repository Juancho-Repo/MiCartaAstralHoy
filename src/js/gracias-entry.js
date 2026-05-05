import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/reservar.css';
import '../styles/gracias.css';
import { initGracias } from './gracias.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGracias);
} else {
  initGracias();
}
