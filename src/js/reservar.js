// Lógica de la página de reserva: formulario, autocomplete de ciudad (GeoNames),
// reglas de combinación de servicios, cálculo de totales y pago con Wompi (USD).
import { servicios } from '../data/servicios.js';
import { escapeHtml, isEmail, trimField } from './sanitize.js';

const e = escapeHtml;

// ==================== Reglas de negocio ====================
const PRINCIPALES = ['carta-digital', 'carta-consulta', 'lectura-anual', 'retorno-solar', 'sinastria'];
const ADDONS = ['cartografia', 'correccion-horaria'];
const THANKS_PATH = '/gracias.html';

async function abrirWompi(payload) {
  const meta = document.querySelector('meta[name="wompi-public-key"]');
  const publicKey = meta && meta.content;
  if (!publicKey || publicKey.startsWith('{{')) {
    alert('Pasarela de pago no configurada.');
    return;
  }

  const totalUSD = Number(payload.totales.total);
  const reference = payload.orden;
  const currency = 'COP';

  // 1. Obtener TRM del día (USD → COP)
  let trm;
  try {
    const trmResp = await fetch('/api/trm');
    if (!trmResp.ok) throw new Error('trm_failed');
    const trmData = await trmResp.json();
    trm = trmData.trm;
    if (!trm || trm <= 0) throw new Error('trm_invalid');
  } catch {
    alert('No pudimos obtener la tasa de cambio. Intenta de nuevo.');
    return;
  }

  // 2. Convertir USD a COP (centavos)
  const totalCOP = Math.round(totalUSD * trm);
  const amountInCents = totalCOP * 100;

  // Guardar TRM y monto COP en el payload para la página de gracias
  payload.trm = trm;
  payload.totalCOP = totalCOP;
  try {
    sessionStorage.setItem('reservaPendiente', JSON.stringify(payload));
  } catch {}

  // 3. Confirmar al usuario el monto en COP
  const fmtCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalCOP);
  const fmtTRM = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(trm);
  const ok = confirm(`Total: $${totalUSD} USD ≈ ${fmtCOP} COP\nTRM del día: $${fmtTRM}\n\n¿Deseas continuar con el pago?`);
  if (!ok) return;

  // 4. Pedir firma de integridad al backend
  let signature;
  try {
    const sigResp = await fetch('/api/wompi-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, amountInCents, currency }),
    });
    if (!sigResp.ok) throw new Error('signature_failed');
    const sigData = await sigResp.json();
    signature = sigData.signature;
    if (!signature) throw new Error('signature_missing');
  } catch {
    alert('No pudimos iniciar el pago. Intenta de nuevo.');
    return;
  }

  // 5. Redirigir al Web Checkout de Wompi en COP
  const params = new URLSearchParams({
    'public-key': publicKey,
    currency: currency,
    'amount-in-cents': String(amountInCents),
    reference: reference,
    'signature:integrity': signature,
    'redirect-url': `${window.location.origin}${THANKS_PATH}`,
  });
  if (payload.email) params.set('customer-data:email', payload.email);
  if (payload.nombre) params.set('customer-data:full-name', payload.nombre);
  if (payload.whatsapp) {
    params.set('customer-data:phone-number', String(payload.whatsapp).replace(/\D/g, ''));
  }

  window.location.href = `https://checkout.wompi.co/p/?${params.toString()}`;
}

function getGeonamesUser() {
  const meta = document.querySelector('meta[name="geonames-user"]');
  return (meta && meta.content) || 'demo';
}

function parsePrice(cop) {
  return Number(String(cop).replace(/\./g, ''));
}

function formatUSD(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n || 0);
}

// ==================== State ====================
const state = {
  principal: null,
  addons: new Set(),
  geo: { lat: null, lng: null, tz: null, offset: null },
  geoPareja: { lat: null, lng: null, tz: null, offset: null },
};

// ==================== Helpers ====================
function setOptions(select, items, placeholder) {
  if (!select) return;
  const opts = [`<option value="">${e(placeholder)}</option>`]
    .concat(items.map((it) => `<option value="${e(it.value)}">${e(it.label)}</option>`));
  select.innerHTML = opts.join('');
}

function poblarSelectsNacimiento() {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ].map((m, i) => ({ value: String(i + 1), label: m }));

  const dias = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

  const anioActual = new Date().getFullYear();
  const anios = [];
  for (let y = anioActual; y >= 1900; y--) anios.push({ value: String(y), label: String(y) });

  const horas = Array.from({ length: 24 }, (_, i) => {
    const v = String(i).padStart(2, '0');
    let label = `${v}`;
    if (i === 0) label += ' (12 am)';
    else if (i === 12) label += ' (12 pm)';
    else if (i < 12) label += ` (${i} am)`;
    else label += ` (${i - 12} pm)`;
    return { value: v, label };
  });

  const minutos = Array.from({ length: 60 }, (_, i) => {
    const v = String(i).padStart(2, '0');
    return { value: v, label: v };
  });

  setOptions(document.querySelector('[data-nac="mes"]'), meses, 'Mes');
  setOptions(document.querySelector('[data-nac="dia"]'), dias, 'Día');
  setOptions(document.querySelector('[data-nac="anio"]'), anios, 'Año');
  setOptions(document.querySelector('[data-nac="hora"]'), horas, 'Hora');
  setOptions(document.querySelector('[data-nac="minuto"]'), minutos, 'Minuto');

  setOptions(document.querySelector('[data-nac2="mes"]'), meses, 'Mes');
  setOptions(document.querySelector('[data-nac2="dia"]'), dias, 'Día');
  setOptions(document.querySelector('[data-nac2="anio"]'), anios, 'Año');
  setOptions(document.querySelector('[data-nac2="hora"]'), horas, 'Hora');
  setOptions(document.querySelector('[data-nac2="minuto"]'), minutos, 'Minuto');
}

// ==================== Servicios (cards) ====================
function renderServicios() {
  const principales = document.querySelector('[data-servicios-principales]');
  const addons = document.querySelector('[data-servicios-addons]');
  if (!principales || !addons) return;

  principales.innerHTML = servicios
    .filter((s) => PRINCIPALES.includes(s.id))
    .map((s) => tarjetaServicio(s, 'principal'))
    .join('');

  addons.innerHTML = servicios
    .filter((s) => ADDONS.includes(s.id))
    .map((s) => tarjetaServicio(s, 'addon'))
    .join('');
}

function tarjetaServicio(s, tipo) {
  const inputType = tipo === 'principal' ? 'radio' : 'checkbox';
  const inputName = tipo === 'principal' ? 'servicio-principal' : 'servicio-addon';
  const destacado = s.destacado ? ' servicio-card--destacado' : '';
  return `
    <label class="servicio-card${destacado}" data-servicio="${e(s.id)}" data-tipo="${tipo}">
      <input type="${inputType}" name="${inputName}" value="${e(s.id)}" />
      <span class="servicio-card__badge">${e(s.badge)}</span>
      <span class="servicio-card__precio">${formatUSD(parsePrice(s.precioUSD))}</span>
      <span class="servicio-card__nombre">${e(s.nombre)}</span>
      <span class="servicio-card__desc">${e(s.idealPara)}</span>
      <span class="servicio-card__check" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-11"/></svg>
      </span>
    </label>
  `;
}

function bindSeleccion() {
  document.addEventListener('change', (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLInputElement)) return;

    if (target.name === 'servicio-principal' && target.checked) {
      state.principal = target.value;
      syncCardStyles();
      togglePareja();
      recalcular();
    }
    if (target.name === 'servicio-addon') {
      if (target.checked) state.addons.add(target.value);
      else state.addons.delete(target.value);
      syncCardStyles();
      recalcular();
    }
  });
}

function syncCardStyles() {
  document.querySelectorAll('.servicio-card').forEach((card) => {
    const id = card.getAttribute('data-servicio');
    const input = card.querySelector('input');
    const activo = input && input.checked;
    card.classList.toggle('is-selected', Boolean(activo));
  });
}

function togglePareja() {
  const bloque = document.querySelector('[data-persona="pareja"]');
  if (!bloque) return;
  if (state.principal === 'sinastria') bloque.hidden = false;
  else bloque.hidden = true;
}

// ==================== Cálculo total ====================
function calcularTotal() {
  const priceOf = (id) => {
    const s = servicios.find((x) => x.id === id);
    return s ? parsePrice(s.precioUSD) : 0;
  };
  let subtotal = 0;
  if (state.principal) subtotal += priceOf(state.principal);
  state.addons.forEach((id) => { subtotal += priceOf(id); });

  const tieneCarto = state.addons.has('cartografia');
  const tieneCorr = state.addons.has('correccion-horaria');
  const tienePrincipal = Boolean(state.principal);
  let pct = 0;
  if (tienePrincipal && tieneCarto && tieneCorr) pct = 0.20;
  else if (tienePrincipal && tieneCorr) pct = 0.10;
  else if (tienePrincipal && tieneCarto) pct = 0.10;

  const descuento = Math.round(subtotal * pct);
  return { subtotal, descuento, total: subtotal - descuento, pct };
}

function recalcular() {
  const { subtotal, descuento, total, pct } = calcularTotal();
  const resumen = document.querySelector('[data-resumen]');
  if (resumen) {
    const items = [];
    if (state.principal) {
      const s = servicios.find((x) => x.id === state.principal);
      if (s) items.push({ nombre: s.nombre, precio: parsePrice(s.precioUSD) });
    }
    state.addons.forEach((id) => {
      const s = servicios.find((x) => x.id === id);
      if (s) items.push({ nombre: s.nombre, precio: parsePrice(s.precioUSD) });
    });
    if (items.length === 0) {
      resumen.innerHTML = '<li class="resumen__vacio">Aún no has seleccionado servicios.</li>';
    } else {
      resumen.innerHTML = items.map((it) => `
        <li><span>${e(it.nombre)}</span><span>${formatUSD(it.precio)}</span></li>
      `).join('');
    }
  }
  const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  set('[data-total="subtotal"]', formatUSD(subtotal));
  set('[data-total="descuento"]', `-${formatUSD(descuento)}`);
  set('[data-total="descuento-pct"]', pct ? `(${Math.round(pct * 100)}%)` : '');
  set('[data-total="total"]', formatUSD(total));
  set('[data-total="total-mobile"]', formatUSD(total));

  const descRow = document.querySelector('[data-total-row="descuento"]');
  if (descRow) descRow.hidden = descuento === 0;

  const submit = document.querySelector('[data-submit]');
  if (submit) submit.disabled = !(state.principal || state.addons.size > 0);

  const sticky = document.querySelector('[data-sticky-total]');
  if (sticky) sticky.hidden = !state.principal;
}

// ==================== Autocomplete GeoNames ====================
function setupCiudad(inputSel, listSel, target) {
  const input = document.querySelector(inputSel);
  const list = document.querySelector(listSel);
  if (!input || !list) return;

  let timer = null;
  let active = -1;

  const cerrar = () => {
    list.hidden = true;
    list.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
    active = -1;
  };

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) { cerrar(); return; }
    timer = setTimeout(() => buscarCiudades(q, list, input, target), 250);
  });

  input.addEventListener('keydown', (ev) => {
    const items = list.querySelectorAll('li');
    if (!items.length) return;
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      active = (active + 1) % items.length;
      actualizarActivo(items, active);
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      active = (active - 1 + items.length) % items.length;
      actualizarActivo(items, active);
    } else if (ev.key === 'Enter' && active >= 0) {
      ev.preventDefault();
      items[active].click();
    } else if (ev.key === 'Escape') {
      cerrar();
    }
  });

  document.addEventListener('click', (ev) => {
    if (!list.contains(ev.target) && ev.target !== input) cerrar();
  });
}

function actualizarActivo(items, active) {
  items.forEach((it, i) => it.setAttribute('aria-selected', i === active ? 'true' : 'false'));
  if (items[active]) items[active].scrollIntoView({ block: 'nearest' });
}

function geonamesJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `geonamesCb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const cleanup = () => {
      delete window[callbackName];
      script.remove();
    };

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('jsonp_failed'));
    };

    script.src = `${url}&callback=${encodeURIComponent(callbackName)}`;
    document.head.appendChild(script);
  });
}

async function geonamesRequest(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`http_${resp.status}`);
    return await resp.json();
  } catch {
    return geonamesJsonp(url);
  }
}

async function buscarCiudades(q, list, input, target) {
  const user = getGeonamesUser();
  const base = 'https://secure.geonames.org';
  try {
    const primaryUrl = `${base}/searchJSON?name_startsWith=${encodeURIComponent(q)}&maxRows=8&featureClass=P&cities=cities1000&orderby=relevance&isNameRequired=true&countryBias=CO&lang=es&style=MEDIUM&username=${encodeURIComponent(user)}`;
    const fallbackUrl = `${base}/searchJSON?q=${encodeURIComponent(q)}&maxRows=8&featureClass=P&cities=cities1000&orderby=relevance&countryBias=CO&lang=es&fuzzy=0.8&style=MEDIUM&username=${encodeURIComponent(user)}`;

    const primaryData = await geonamesRequest(primaryUrl);

    // GeoNames devuelve { status: { message, value } } cuando hay un error de API
    if (primaryData.status) {
      const msg = primaryData.status.message || 'Error de GeoNames';
      throw new Error(`geonames_status_${primaryData.status.value}: ${msg}`);
    }

    let geonames = primaryData.geonames || [];

    if (!geonames.length) {
      const fallbackData = await geonamesRequest(fallbackUrl);
      if (fallbackData.status) throw new Error(`geonames_status_${fallbackData.status.value}: ${fallbackData.status.message}`);
      geonames = fallbackData.geonames || [];
    }

    const items = geonames.map((g) => ({
      label: `${g.name}${g.adminName1 ? ', ' + g.adminName1 : ''}, ${g.countryName}`,
      lat: g.lat,
      lng: g.lng,
      geonameId: g.geonameId,
      countryCode: g.countryCode,
    }));
    renderListado(items, list, input, target);
  } catch (err) {
    const isActivation = err && String(err.message).includes('Please activate');
    const msg = isActivation
      ? 'La cuenta GeoNames no está activada. Activa el servicio web gratuito en geonames.org.'
      : 'No se pudo buscar la ciudad. Intenta de nuevo.';
    list.innerHTML = `<li class="autocomplete-list__empty" role="option">${e(msg)}</li>`;
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }
}

function renderListado(items, list, input, target) {
  if (!items.length) {
    list.innerHTML = '<li class="autocomplete-list__empty" role="option">Sin resultados</li>';
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    return;
  }
  list.innerHTML = items.map((it, i) => `
    <li role="option" data-idx="${i}" aria-selected="false">${e(it.label)}</li>
  `).join('');
  list.hidden = false;
  input.setAttribute('aria-expanded', 'true');

  list.querySelectorAll('li').forEach((li, idx) => {
    li.addEventListener('click', () => {
      const item = items[idx];
      input.value = item.label;
      seleccionarCiudad(item, target);
      list.hidden = true;
      list.innerHTML = '';
      input.setAttribute('aria-expanded', 'false');
    });
  });
}

async function seleccionarCiudad(item, target) {
  const store = target === 'principal' ? state.geo : state.geoPareja;
  store.lat = item.lat;
  store.lng = item.lng;

  const tz = await fetchTimezone(item.lat, item.lng);
  if (tz) {
    store.tz = tz.timezoneId;
    store.offset = tz.gmtOffset;
  }

  escribirHiddens(target, store);
  if (target === 'principal') pintarLecturaGeo(store);
}

async function fetchTimezone(lat, lng) {
  const user = getGeonamesUser();
  const url = `https://secure.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=${encodeURIComponent(user)}`;
  try {
    const data = await geonamesRequest(url);
    if (data && data.status) return null; // error de API, ignorar silenciosamente
    return data;
  } catch {
    return null;
  }
}

function escribirHiddens(target, geo) {
  const prefix = target === 'principal' ? 'nac' : 'nac2';
  const set = (attr, val) => {
    const el = document.querySelector(`[data-${prefix}="${attr}"]`);
    if (el) el.value = val == null ? '' : String(val);
  };
  set('lat', geo.lat);
  set('lng', geo.lng);
  set('tz', geo.tz);
  if (target === 'principal') set('utc_offset', geo.offset != null ? formatOffset(geo.offset) : '');
  else set('utc_offset', geo.offset != null ? formatOffset(geo.offset) : '');
}

function formatOffset(offsetHours) {
  const sign = offsetHours >= 0 ? '+' : '-';
  const abs = Math.abs(offsetHours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function pintarLecturaGeo(geo) {
  const readout = document.querySelector('[data-geo-readout]');
  if (!readout) return;
  readout.hidden = false;
  const set = (attr, val) => {
    const el = readout.querySelector(`[data-geo="${attr}"]`);
    if (el) el.textContent = val || '—';
  };
  set('lat', geo.lat);
  set('lng', geo.lng);
  set('tz', geo.tz);
}

// ==================== Submit ====================
function validar(form) {
  const errores = [];
  const setErr = (name, msg) => {
    const box = document.querySelector(`[data-error-for="${name}"]`);
    if (box) box.textContent = msg || '';
    if (msg) errores.push({ name, msg });
  };

  ['nombre', 'email', 'whatsapp', 'fecha_nac', 'hora_nac', 'ciudad', 'seleccion',
   'nombre_pareja', 'fecha_nac_p', 'hora_nac_p', 'ciudad_p'].forEach((k) => setErr(k, ''));

  const nombre = trimField(form.nombre.value);
  if (!nombre) setErr('nombre', 'Tu nombre es obligatorio.');

  const email = trimField(form.email.value);
  if (!email || !isEmail(email)) setErr('email', 'Correo inválido.');

  const wa = trimField(form.whatsapp.value);
  if (!wa || wa.replace(/\D/g, '').length < 8) setErr('whatsapp', 'Número inválido.');

  const mes = form.mes?.value;
  const dia = form.dia?.value;
  const anio = form.anio?.value;
  if (!mes || !dia || !anio) setErr('fecha_nac', 'Completa tu fecha de nacimiento.');

  const hora = form.hora?.value;
  const minuto = form.minuto?.value;
  if (!hora || !minuto) setErr('hora_nac', 'Completa tu hora de nacimiento.');

  const ciudad = trimField(form.ciudad.value);
  if (!ciudad) setErr('ciudad', 'Selecciona tu ciudad de nacimiento.');
  if (!state.geo.lat) setErr('ciudad', 'Elige una ciudad desde la lista para capturar sus coordenadas.');

  if (!state.principal && state.addons.size === 0) setErr('seleccion', 'Selecciona al menos un servicio.');

  // Validar segunda persona si se seleccionó sinastría
  if (state.principal === 'sinastria') {
    const nombreP = trimField(form.nombre_pareja?.value);
    if (!nombreP) setErr('nombre_pareja', 'El nombre de la segunda persona es obligatorio.');

    const mesP = form.mes_p?.value;
    const diaP = form.dia_p?.value;
    const anioP = form.anio_p?.value;
    if (!mesP || !diaP || !anioP) setErr('fecha_nac_p', 'Completa la fecha de nacimiento de la segunda persona.');

    const horaP = form.hora_p?.value;
    const minutoP = form.minuto_p?.value;
    if (!horaP || !minutoP) setErr('hora_nac_p', 'Completa la hora de nacimiento de la segunda persona.');

    const ciudadP = trimField(form.ciudad_p?.value);
    if (!ciudadP) setErr('ciudad_p', 'Selecciona la ciudad de nacimiento de la segunda persona.');
    else if (!state.geoPareja?.lat) setErr('ciudad_p', 'Elige una ciudad desde la lista para capturar sus coordenadas.');
  }

  return errores;
}

function recolectarDatos(form) {
  const data = new FormData(form);
  const out = {};
  data.forEach((v, k) => { out[k] = typeof v === 'string' ? v : ''; });
  out.servicios = {
    principal: state.principal,
    addons: Array.from(state.addons),
  };
  out.totales = calcularTotal();
  out.geo = state.geo;
  out.geoPareja = state.geoPareja;
  return out;
}

function generarNumeroOrden() {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `MCAH-${y}${m}${day}-${rand}`;
}

function handleSubmit() {
  const form = document.getElementById('reservar-form');
  if (!form) return;
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const errores = validar(form);
    if (errores.length) {
      const first = document.querySelector(`[data-error-for="${errores[0].name}"]`);
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const payload = recolectarDatos(form);
    payload.orden = generarNumeroOrden();

    try {
      sessionStorage.setItem('reservaPendiente', JSON.stringify(payload));
    } catch {}

    // El correo se enviará desde gracias.js cuando Wompi confirme el pago.
    await abrirWompi(payload);
  });
}

// ==================== Sticky + utilidades ====================
function initSticky() {
  const btn = document.querySelector('[data-scroll-pago]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.querySelector('.reservar__pago')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function setYear() {
  const el = document.querySelector('[data-year]');
  if (el) el.textContent = String(new Date().getFullYear());
}

// ==================== Boot ====================
export function initReservar() {
  poblarSelectsNacimiento();
  renderServicios();
  bindSeleccion();
  setupCiudad('#ciudad', '#ciudad-listbox', 'principal');
  setupCiudad('#ciudad_p', '#ciudad_p-listbox', 'pareja');
  handleSubmit();
  initSticky();
  recalcular();
  setYear();
}
