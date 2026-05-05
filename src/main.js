// Entry Vite: hidrata secciones con datos + inicializa modulos de comportamiento.
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';

import { servicios } from './data/servicios.js';
import { testimonios } from './data/testimonios.js';
import { faq } from './data/faq.js';

import { initNav } from './js/nav.js';
import { initReveal } from './js/reveal.js';
import { initTilt } from './js/tilt.js';
import { initAccordion } from './js/accordion.js';
import { initCursor } from './js/cursor.js';
import { initNumberTicker } from './js/numberTicker.js';
import { initMarquee } from './js/marquee.js';
import { escapeHtml } from './js/sanitize.js';
import { initCosmos } from './js/cosmos.js';
import { initHeroChart } from './js/heroChart.js';

// ==================== Render helpers ====================
// escape(...) garantiza que el contenido de servicios/testimonios/faq no
// introduzca HTML arbitrario, aunque por ahora provenga de archivos locales.
const e = escapeHtml;

// Mantiene ambas monedas disponibles para una futura conmutacion por pais/IP.
const CURRENCY_CONFIG = {
  USD: {
    locale: 'en-US',
    currency: 'USD',
  },
  COP: {
    locale: 'es-CO',
    currency: 'COP',
  },
};

function parsePrice(value) {
  return Number(String(value).replace(/\./g, '').replace(/,/g, '.'));
}

function formatMoney(value, code) {
  const config = CURRENCY_CONFIG[code];
  if (!config) return String(value);
  const formatted = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    maximumFractionDigits: 0,
  }).format(value);
  return code === 'USD'
    ? `USD ${formatted.replace(/^\$/, '').trim()}`
    : formatted;
}

function getPreferredServiceCurrency() {
  // Por decision actual del negocio, la landing muestra USD siempre.
  // COP se conserva en datos para una futura conmutacion por pais/IP.
  return 'USD';
}

function getServicePriceState(servicio, preferredCurrency = 'USD') {
  const priceMap = {
    USD: {
      raw: String(servicio.precioUSD),
      amount: parsePrice(servicio.precioUSD),
    },
    COP: {
      raw: String(servicio.precioCOP),
      amount: parsePrice(servicio.precioCOP),
    },
  };
  const primaryCode = preferredCurrency === 'COP' ? 'COP' : 'USD';
  const primaryAmount = priceMap[primaryCode].amount;
  const originalAmount = primaryAmount !== null ? Math.round(primaryAmount * 1.2) : null;

  return {
    primaryText: formatMoney(primaryAmount, primaryCode),
    originalText: formatMoney(originalAmount, primaryCode),
    rawPrices: {
      USD: priceMap.USD.raw,
      COP: priceMap.COP.raw,
    },
  };
}

// Variantes suaves para que el carrusel no se vea repetitivo aunque el
// contenido provenga del mismo origen.
const TESTIMONIO_THEMES = [
  {
    bg: 'linear-gradient(135deg, #fff7ec 0%, #ffe7d2 100%)',
    border: '#f3c9a8',
    avatar: 'linear-gradient(135deg, #ffb36b, #ff7f50)',
  },
  {
    bg: 'linear-gradient(135deg, #eef8ff 0%, #d7ebff 100%)',
    border: '#b8d7ff',
    avatar: 'linear-gradient(135deg, #67b7ff, #3a5fd9)',
  },
  {
    bg: 'linear-gradient(135deg, #f4efff 0%, #e3d8ff 100%)',
    border: '#ccb9ff',
    avatar: 'linear-gradient(135deg, #9a77ff, #6f52d9)',
  },
  {
    bg: 'linear-gradient(135deg, #effcf7 0%, #d5f5ea 100%)',
    border: '#b7ead7',
    avatar: 'linear-gradient(135deg, #3fcf9a, #1a9a7a)',
  },
  {
    bg: 'linear-gradient(135deg, #fff4fb 0%, #ffd9ed 100%)',
    border: '#f3bddb',
    avatar: 'linear-gradient(135deg, #ff89c7, #d85fa1)',
  },
];

function renderServicios() {
  const grid = document.querySelector('[data-servicios]');
  if (!grid) return;
  const preferredCurrency = getPreferredServiceCurrency();
  grid.innerHTML = servicios.map((s, idx) => {
    const badgeClass = s.destacado ? 'badge badge--gold' : 'badge';
    const cardClass = 'card reveal' + (s.destacado ? ' card--destacado' : '');
    const delay = (idx % 3) * 90;
    const priceState = getServicePriceState(s, preferredCurrency);
    return `
      <article
        class="${cardClass}"
        data-tilt
        data-price-usd="${e(priceState.rawPrices.USD)}"
        data-price-cop="${e(priceState.rawPrices.COP)}"
        style="--reveal-delay:${delay}ms"
      >
        <header class="servicio__head">
          <span class="${badgeClass}">${e(s.badge)}</span>
          <div class="servicio__precio">
            <strong>${e(priceState.primaryText)}</strong>
            <span class="servicio__precio-anterior">${e(priceState.originalText)}</span>
          </div>
        </header>
        <h3>${e(s.nombre)}</h3>
        <p class="servicio__desc">${e(s.descripcion)}</p>
        <ul class="servicio__incluye">
          ${s.incluye.map((i) => `<li>${e(i)}</li>`).join('')}
        </ul>
        <p class="servicio__ideal"><strong>Ideal para ti si</strong><br>${e(s.idealPara)}</p>
        ${s.nota ? `<p class="servicio__nota">${e(s.nota)}</p>` : ''}
        <a class="btn btn--primary servicio__cta" href="/reservar.html#${e(s.id)}" data-pendiente="true" aria-label="${e(s.cta)} - ${e(s.nombre)}">
          ${e(s.cta)}
        </a>
      </article>
    `;
  }).join('');
}

function renderTestimonios() {
  const track = document.querySelector('[data-testimonios]');
  if (!track) return;
  track.innerHTML = testimonios.map((t, idx) => {
    const theme = TESTIMONIO_THEMES[idx % TESTIMONIO_THEMES.length];
    const iniciales = t.autor.split(' ').map((p) => p[0]).slice(0, 2).join('');
    const avatar = t.foto
      ? `<span class="testimonio__avatar testimonio__avatar--photo"><img src="${e(t.foto)}" alt="Foto de ${e(t.autor)}" loading="lazy" decoding="async" /></span>`
      : `<span class="testimonio__avatar" aria-hidden="true">${e(iniciales)}</span>`;
    return `
      <figure class="testimonio" style="--testimonio-bg:${theme.bg};--testimonio-border:${theme.border};--testimonio-avatar:${theme.avatar}">
        <div class="testimonio__stars" aria-label="5 estrellas">${'\u2605'.repeat(5)}</div>
        <blockquote class="testimonio__texto">${e(t.texto)}</blockquote>
        <figcaption class="testimonio__autor">
          ${avatar}
          <span class="testimonio__meta">
            <strong>${e(t.autor)}</strong>
            <span>${e(t.servicio)}</span>
          </span>
        </figcaption>
      </figure>
    `;
  }).join('');
}

function renderFaq() {
  const wrap = document.querySelector('[data-faq]');
  if (!wrap) return;
  wrap.innerHTML = faq.map((f, idx) => {
    const id = `faq-${idx}`;
    return `
      <div class="accordion__item reveal">
        <button class="accordion__trigger" id="${id}-t" aria-expanded="false" aria-controls="${id}-c">
          <span>${e(f.q)}</span>
          <span class="accordion__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </span>
        </button>
        <div class="accordion__content" id="${id}-c" role="region" aria-labelledby="${id}-t">
          <div class="accordion__content-inner">${e(f.a)}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderStarfield() {
  document.querySelectorAll('.starfield').forEach((sf) => {
    if (sf.dataset.seeded) return;
    const n = window.matchMedia('(max-width: 768px)').matches ? 20 : 40;
    const stars = Array.from({ length: n }, () => {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const delay = Math.random() * 4;
      return `<span style="top:${top}%;left:${left}%;animation-delay:${delay}s"></span>`;
    }).join('');
    sf.innerHTML = stars;
    sf.dataset.seeded = 'true';
  });
}

function injectFaqSchema() {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  });
  document.head.appendChild(script);
}

function injectServiceSchema() {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': servicios.map((s) => ({
      '@type': 'Service',
      name: s.nombre,
      description: s.descripcion,
      provider: { '@type': 'Organization', name: 'Mi Carta Astral Hoy' },
      areaServed: 'Global',
      offers: [
        {
          '@type': 'Offer', priceCurrency: 'COP',
          price: String(s.precioCOP).replace(/\./g, ''),
          availability: 'https://schema.org/InStock'
        },
        {
          '@type': 'Offer', priceCurrency: 'USD',
          price: String(s.precioUSD),
          availability: 'https://schema.org/InStock'
        }
      ]
    }))
  });
  document.head.appendChild(script);
}

function setYear() {
  const el = document.querySelector('[data-year]');
  if (el) el.textContent = String(new Date().getFullYear());
}

// ==================== Bootstrap ====================
function boot() {
  initHeroChart();
  renderStarfield();
  renderServicios();
  renderTestimonios();
  renderFaq();
  injectFaqSchema();
  injectServiceSchema();
  setYear();

  initCosmos();
  initNav();
  initAccordion();
  initMarquee();
  initNumberTicker();
  // Tilt y cursor se inicializan despues del primer paint para no bloquear LCP.
  requestAnimationFrame(() => {
    initTilt();
    initCursor();
    initReveal(); // al final para que capture todos los .reveal inyectados
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
