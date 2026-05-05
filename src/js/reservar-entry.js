// Entry específico para reservar.html. Carga estilos base + estilos de la página
// y arranca el módulo de reserva.
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/reservar.css';

import { initReservar } from './reservar.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReservar);
} else {
  initReservar();
}
