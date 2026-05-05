import { Resend } from 'resend';

const SERVICIO_NOMBRES = {
  'carta-digital': 'Carta Astral Digital',
  'cartografia': 'Cartografía Astral',
  'correccion-horaria': 'Corrección Horaria',
  'carta-consulta': 'Carta Astral + Consulta Personalizada',
  'lectura-anual': 'Carta Astral + Consulta + Tránsitos (1 año)',
  'retorno-solar': 'Retorno Solar + Consulta + Tránsitos (1 año)',
  'sinastria': 'Sinastría de Pareja / Socios',
};

const MESES = [
  '', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

function fmtUSD(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n || 0);
}

function fmtFecha(dia, mes, anio) {
  if (!dia || !mes || !anio) return '—';
  const m = MESES[Number(mes)] || mes;
  return `${dia} de ${m} de ${anio}`;
}

function fmtHora(hora, minuto) {
  if (!hora || !minuto) return '—';
  return `${hora}:${minuto}`;
}

function requiereCita(principalId) {
  return ['carta-consulta', 'lectura-anual', 'retorno-solar', 'sinastria'].includes(principalId);
}

function renderClienteHtml(data, calendlyUrl) {
  const { nombre, orden, servicios, totales } = data;
  const principalNombre = SERVICIO_NOMBRES[servicios?.principal] || servicios?.principal || null;
  const addonsNombres = (servicios?.addons || []).map((id) => SERVICIO_NOMBRES[id] || id);
  const mostrarCalendly = Boolean(calendlyUrl) && requiereCita(servicios?.principal);

  const itemsLista = [
    principalNombre ? `<li><strong>${esc(principalNombre)}</strong></li>` : '',
    ...addonsNombres.map((n) => `<li>${esc(n)}</li>`),
  ].filter(Boolean).join('');

  const descuentoLinea = totales?.descuento
    ? `<tr><td style="color:#5C5780;">Descuento</td><td align="right">-${fmtUSD(totales.descuento)}</td></tr>`
    : '';

  const bloqueCalendly = mostrarCalendly ? `
    <div style="margin:28px 0;padding:24px;background:linear-gradient(135deg,#FFF7E0,#FFFBEB);border-radius:14px;text-align:center;border:1px solid #F1D680;">
      <h3 style="font-family:Fraunces,Georgia,serif;font-weight:500;margin:0 0 8px;font-size:1.15rem;">Último paso: agenda tu cita</h3>
      <p style="margin:0 0 16px;color:#5C5780;font-size:0.92rem;line-height:1.5;">
        Selecciona el horario que mejor te funcione para tu lectura.
      </p>
      <a href="${esc(calendlyUrl)}" target="_blank" rel="noopener"
         style="display:inline-block;background:#2D8C5E;color:#fff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:999px;font-size:0.98rem;">
        Agendar mi cita
      </a>
    </div>` : '';

  const cierreTexto = mostrarCalendly
    ? 'Trae tus dudas preparadas para la sesión. Si tienes preguntas antes de agendar, respóndenos a este correo.'
    : 'Gracias por tu compra. Si necesitamos confirmar algún detalle de tu lectura, te contactaremos por este mismo correo.';

  return `<!doctype html>
<html><body style="margin:0;font-family:Manrope,Arial,sans-serif;background:#F4F2FA;padding:24px;color:#1A1730;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;padding:32px;border:1px solid #D6D2EC;">
    <p style="margin:0 0 8px;font-size:0.78rem;letter-spacing:0.16em;text-transform:uppercase;color:#7B5EA7;font-weight:600;">Reserva confirmada</p>
    <h1 style="font-family:Fraunces,Georgia,serif;font-weight:500;margin:0 0 16px;font-size:1.7rem;letter-spacing:-0.01em;">Hola ${esc(nombre || '')} ✨</h1>
    <p style="line-height:1.6;margin:0 0 18px;">Recibimos tu pago y tu reserva quedó confirmada. Estos son los detalles:</p>

    <p style="margin:0 0 18px;padding:10px 14px;background:#F4F2FA;border-radius:10px;font-size:0.92rem;">
      <strong>N° de orden:</strong> ${esc(orden || '—')}
    </p>

    <h2 style="font-family:Fraunces,Georgia,serif;font-weight:500;font-size:1.05rem;margin:24px 0 8px;">Servicios contratados</h2>
    <ul style="margin:0 0 18px;padding-left:20px;line-height:1.7;">${itemsLista}</ul>

    <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:0.95rem;">
      <tr><td style="color:#5C5780;">Subtotal</td><td align="right">${fmtUSD(totales?.subtotal)}</td></tr>
      ${descuentoLinea}
      <tr><td style="padding-top:8px;border-top:1px solid #D6D2EC;font-weight:600;">Total pagado</td>
          <td align="right" style="padding-top:8px;border-top:1px solid #D6D2EC;font-weight:600;font-family:Fraunces,Georgia,serif;font-size:1.2rem;color:#2D8C5E;">${fmtUSD(totales?.total)}</td></tr>
    </table>

    ${bloqueCalendly}

    <p style="line-height:1.6;color:#5C5780;font-size:0.9rem;margin:18px 0 0;">
      ${cierreTexto}
    </p>

    <p style="color:#5C5780;font-size:0.78rem;margin-top:28px;border-top:1px solid #EFEAF8;padding-top:14px;">
      Mi Carta Astral Hoy · Astrología consciente
    </p>
  </div>
</body></html>`;
}

function renderAdminHtml(data) {
  const { nombre, email, whatsapp, orden, servicios, totales } = data;
  const principalNombre = SERVICIO_NOMBRES[servicios?.principal] || servicios?.principal || '—';
  const addonsHtml = (servicios?.addons || [])
    .map((id) => `<li>${esc(SERVICIO_NOMBRES[id] || id)}</li>`)
    .join('') || '<li><em>Ninguno</em></li>';

  const fecha = fmtFecha(data.dia, data.mes, data.anio);
  const hora = data.hora_desconocida === 'on'
    ? '<em>Hora desconocida — requiere corrección horaria</em>'
    : fmtHora(data.hora, data.minuto);

  const geo = data.geo || {};
  const geoLinea = [
    geo.lat ? `Lat: ${esc(String(geo.lat))}` : null,
    geo.lng ? `Lng: ${esc(String(geo.lng))}` : null,
    geo.tz ? `TZ: ${esc(String(geo.tz))}` : null,
    data.utc_offset ? `Offset: ${esc(String(data.utc_offset))}` : null,
  ].filter(Boolean).join(' · ') || '—';

  let sinastriaBloque = '';
  if (servicios?.principal === 'sinastria') {
    const fecha2 = fmtFecha(data.dia_p, data.mes_p, data.anio_p);
    const hora2 = fmtHora(data.hora_p, data.minuto_p);
    const geo2 = data.geoPareja || {};
    const geo2Linea = [
      geo2.lat ? `Lat: ${esc(String(geo2.lat))}` : null,
      geo2.lng ? `Lng: ${esc(String(geo2.lng))}` : null,
      geo2.tz ? `TZ: ${esc(String(geo2.tz))}` : null,
    ].filter(Boolean).join(' · ') || '—';

    sinastriaBloque = `
    <h2 style="font-family:Fraunces,Georgia,serif;font-weight:500;font-size:1.05rem;margin:22px 0 6px;">Segunda persona (sinastría)</h2>
    <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
      <tr><td style="padding:4px 0;color:#5C5780;width:140px;">Nombre</td><td><strong>${esc(data.nombre_pareja || '—')}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#5C5780;">Fecha nac.</td><td>${esc(fecha2)}</td></tr>
      <tr><td style="padding:4px 0;color:#5C5780;">Hora nac.</td><td>${esc(hora2)}</td></tr>
      <tr><td style="padding:4px 0;color:#5C5780;">Ciudad nac.</td><td>${esc(data.ciudad_p || '—')}</td></tr>
      <tr><td style="padding:4px 0;color:#5C5780;">Geo</td><td style="font-family:monospace;font-size:0.82rem;">${geo2Linea}</td></tr>
    </table>`;
  }

  const descuentoLinea = totales?.descuento
    ? `<tr><td style="padding:4px 0;color:#5C5780;">Descuento</td><td align="right">-${fmtUSD(totales.descuento)} (${Math.round((totales.pct || 0) * 100)}%)</td></tr>`
    : '';

  const ahora = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  return `<!doctype html>
<html><body style="margin:0;font-family:Manrope,Arial,sans-serif;background:#F4F2FA;padding:24px;color:#1A1730;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;padding:28px;border:1px solid #D6D2EC;">
    <p style="margin:0 0 6px;font-size:0.78rem;letter-spacing:0.16em;text-transform:uppercase;color:#C9A020;font-weight:700;">Nueva reserva</p>
    <h1 style="font-family:Fraunces,Georgia,serif;font-weight:500;margin:0 0 6px;font-size:1.4rem;">${esc(nombre || '—')}</h1>
    <p style="margin:0 0 16px;color:#5C5780;font-size:0.88rem;">
      Orden <strong>${esc(orden || '—')}</strong> · ${esc(ahora)}
    </p>

    <h2 style="font-family:Fraunces,Georgia,serif;font-weight:500;font-size:1.05rem;margin:22px 0 6px;">Contacto</h2>
    <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
      <tr><td style="padding:4px 0;color:#5C5780;width:140px;">Nombre</td><td><strong>${esc(nombre || '—')}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#5C5780;">Email</td><td><a href="mailto:${esc(email || '')}">${esc(email || '—')}</a></td></tr>
      <tr><td style="padding:4px 0;color:#5C5780;">WhatsApp</td><td><a href="https://wa.me/${esc(String(whatsapp || '').replace(/\D/g, ''))}">${esc(whatsapp || '—')}</a></td></tr>
    </table>

    <h2 style="font-family:Fraunces,Georgia,serif;font-weight:500;font-size:1.05rem;margin:22px 0 6px;">Datos de nacimiento</h2>
    <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
      <tr><td style="padding:4px 0;color:#5C5780;width:140px;">Fecha</td><td>${esc(fecha)}</td></tr>
      <tr><td style="padding:4px 0;color:#5C5780;">Hora</td><td>${hora}</td></tr>
      <tr><td style="padding:4px 0;color:#5C5780;">Ciudad</td><td>${esc(data.ciudad || '—')}</td></tr>
      <tr><td style="padding:4px 0;color:#5C5780;">Geo</td><td style="font-family:monospace;font-size:0.82rem;">${geoLinea}</td></tr>
    </table>

    ${sinastriaBloque}

    <h2 style="font-family:Fraunces,Georgia,serif;font-weight:500;font-size:1.05rem;margin:22px 0 6px;">Servicios</h2>
    <p style="margin:0 0 6px;"><strong>${esc(principalNombre)}</strong></p>
    <p style="margin:0 0 6px;color:#5C5780;font-size:0.9rem;">Complementos:</p>
    <ul style="margin:0 0 14px;padding-left:20px;font-size:0.92rem;line-height:1.6;">${addonsHtml}</ul>

    <table style="width:100%;border-collapse:collapse;font-size:0.95rem;margin-top:8px;">
      <tr><td style="padding:4px 0;color:#5C5780;">Subtotal</td><td align="right">${fmtUSD(totales?.subtotal)}</td></tr>
      ${descuentoLinea}
      <tr><td style="padding:8px 0;border-top:1px solid #D6D2EC;font-weight:600;">Total cobrado</td>
          <td align="right" style="padding:8px 0;border-top:1px solid #D6D2EC;font-weight:600;font-family:Fraunces,Georgia,serif;font-size:1.15rem;color:#2D8C5E;">${fmtUSD(totales?.total)}</td></tr>
    </table>

    <p style="color:#5C5780;font-size:0.78rem;margin-top:24px;border-top:1px solid #EFEAF8;padding-top:14px;">
      Notificación interna · Mi Carta Astral Hoy
    </p>
  </div>
</body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end('Method Not Allowed');
  }

  let data;
  try {
    data = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'invalid_body' }));
  }

  if (!data.email || !data.nombre) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'missing_fields' }));
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const adminTo = process.env.RESEND_TO_INTERNAL;
  const calendlyUrl = process.env.CALENDLY_URL || '';

  const missing = [];
  if (!apiKey) missing.push('RESEND_API_KEY');
  if (!from) missing.push('RESEND_FROM');
  if (!adminTo) missing.push('RESEND_TO_INTERNAL');
  if (missing.length) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'missing_env', missing }));
  }

  const resend = new Resend(apiKey);
  const totalUsd = data.totales?.total ?? '';

  try {
    const [clienteRes, adminRes] = await Promise.allSettled([
      resend.emails.send({
        from,
        to: [data.email],
        subject: `Reserva confirmada · ${data.orden || 'Mi Carta Astral Hoy'}`,
        html: renderClienteHtml(data, calendlyUrl),
      }),
      resend.emails.send({
        from,
        to: [adminTo],
        replyTo: data.email,
        subject: `Nueva reserva · ${data.orden || ''} · ${data.nombre || ''} · ${fmtUSD(totalUsd)}`,
        html: renderAdminHtml(data),
      }),
    ]);

    const clienteOk = clienteRes.status === 'fulfilled';
    const adminOk = adminRes.status === 'fulfilled';

    res.statusCode = clienteOk ? 200 : 502;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      ok: clienteOk,
      cliente: clienteOk,
      admin: adminOk,
      detail: {
        cliente: clienteOk ? null : String(clienteRes.reason?.message || clienteRes.reason),
        admin: adminOk ? null : String(adminRes.reason?.message || adminRes.reason),
      },
    }));
  } catch (err) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'send_failed', detail: String(err?.message || err) }));
  }
}
