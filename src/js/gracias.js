// gracias.js: lee el estado del pago Wompi, muestra el resumen, envía correos
// (idempotente) y muestra el bloque de Calendly para servicios con consulta.
import { servicios } from '../data/servicios.js';

const CON_CITA = ['carta-consulta', 'lectura-anual', 'retorno-solar', 'sinastria'];
const EMAIL_SENT_PREFIX = 'reservaCorreoEnviado:';

export async function initGracias() {
  const raw = sessionStorage.getItem('reservaPendiente');
  if (!raw) {
    mostrarSinDatos();
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    mostrarSinDatos();
    return;
  }

  // Pintar resumen primero (no depende del status)
  pintarServicios(data);

  // Consultar estado del pago a Wompi
  const payment = await leerEstadoPago();

  pintarEncabezado(data, payment);
  pintarEstadoInicial(payment);

  // Si tiene consulta, mostrar Calendly siempre (no depende del status)
  if (CON_CITA.includes(data.servicios?.principal)) {
    pintarCalendly(data);
  }

  if (!payment.approved) return;

  // Enviar correos una sola vez
  enviarCorreosUnaVez(raw, data);
}

async function leerEstadoPago() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return { approved: false, code: null };

  try {
    const r = await fetch(`/api/wompi-status?id=${encodeURIComponent(id)}`);
    if (!r.ok) return { approved: false, status: 'ERROR', transaction: id };
    const data = await r.json();
    return {
      approved: data.status === 'APPROVED',
      status: data.status,
      ref: data.reference,
      transaction: id,
    };
  } catch {
    return { approved: false, status: 'ERROR', transaction: id };
  }
}

function setText(sel, val) {
  const el = document.querySelector(sel);
  if (el && val != null && val !== '') el.textContent = val;
}

function setStatus(kind, text) {
  const el = document.querySelector('[data-status]');
  if (!el) return;
  el.hidden = false;
  el.dataset.kind = kind;
  el.textContent = text;
}

function pintarEncabezado(data, payment) {
  setText('[data-nombre]', data.nombre);
  setText('[data-email]', data.email);
  setText('[data-orden]', payment.ref || data.orden || payment.transaction || '—');
}

function pintarServicios(data) {
  const block = document.querySelector('[data-servicios-block]');
  if (!block || !data.servicios) return;
  block.hidden = false;

  const lista = block.querySelector('[data-servicios-lista]');
  if (!lista) return;
  lista.innerHTML = '';

  const getNombre = (id) => {
    const s = servicios.find((x) => x.id === id);
    return s ? s.nombre : id;
  };

  if (data.servicios.principal) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${getNombre(data.servicios.principal)}</strong>`;
    lista.appendChild(li);
  }

  (data.servicios.addons || []).forEach((id) => {
    const li = document.createElement('li');
    li.textContent = getNombre(id);
    lista.appendChild(li);
  });

  const fmt = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n || 0);

  const totales = data.totales || {};
  setText('[data-g-subtotal]', fmt(totales.subtotal));
  setText('[data-g-total]', fmt(totales.total));

  if (totales.descuento) {
    const row = document.querySelector('[data-g-descuento-row]');
    if (row) row.hidden = false;
    setText('[data-g-descuento]', '-' + fmt(totales.descuento));
  }
}

function pintarEstadoInicial(payment) {
  if (payment.approved) {
    setStatus('ok', 'Pago confirmado. Enviando correos con el resumen de tu compra.');
    return;
  }

  if (payment.status) {
    setStatus('warn', 'El pago no aparece como aprobado todavía. Si ya pagaste, no cierres esta página y verifica el estado de la transacción.');
    return;
  }

  setStatus('warn', 'No pudimos verificar el estado del pago desde esta página. Si ya pagaste, revisa tu correo o escríbenos por WhatsApp.');
}

function pintarCalendly(data) {
  const meta = document.querySelector('meta[name="calendly-url"]');
  const url = meta && meta.content;
  const container = document.querySelector('[data-calendly-embed]');
  const block = document.querySelector('[data-calendly-block]');
  if (!container || !block || !url || url.startsWith('{{')) return;

  block.hidden = false;

  const init = () => {
    if (window.Calendly) {
      container.innerHTML = '';
      container.style.minHeight = '820px';

      const params = new URLSearchParams({ hide_gdpr_banner: '1' });
      if (data.nombre) params.set('name', data.nombre);
      if (data.email) params.set('email', data.email);

      window.Calendly.initInlineWidget({
        url: url + '?' + params.toString(),
        parentElement: container,
        prefill: { name: data.nombre || '', email: data.email || '' },
      });

      setTimeout(() => {
        const iframe = container.querySelector('iframe');
        if (iframe) {
          iframe.style.height = '820px';
          iframe.style.minHeight = '820px';
        }
      }, 1000);
    } else {
      setTimeout(init, 500);
    }
  };
  init();
}

async function enviarCorreosUnaVez(raw, data) {
  const orderKey = data.orden || 'sin-orden';
  const sentKey = `${EMAIL_SENT_PREFIX}${orderKey}`;
  if (sessionStorage.getItem(sentKey) === '1') {
    setStatus('ok', 'Pago confirmado. Los correos de confirmación ya fueron enviados.');
    return;
  }

  try {
    const resp = await fetch('/api/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: raw,
    });
    const result = await resp.json().catch(() => ({}));

    if (resp.ok && result?.cliente) {
      sessionStorage.setItem(sentKey, '1');
      sessionStorage.removeItem('reservaPendiente');
      setStatus('ok', 'Pago confirmado. Te enviamos el correo con el resumen y los próximos pasos.');
      return;
    }

    setStatus('error', 'Pago confirmado, pero el correo no se pudo enviar todavía. Revisa la configuración del servidor o intenta nuevamente.');
  } catch {
    setStatus('error', 'Pago confirmado, pero falló el envío del correo. Intenta recargar esta página en unos segundos.');
  }
}

function mostrarSinDatos() {
  setStatus('warn', 'No encontramos tu reserva pendiente en este navegador. Si ya pagaste, revisa tu correo o escríbenos por WhatsApp.');
}
