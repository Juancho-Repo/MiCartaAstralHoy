// Vercel Function: devuelve la TRM (Tasa Representativa del Mercado) del día.
// Fuente: datos.gov.co (Superintendencia Financiera de Colombia).
// Caché en memoria de 1 hora — la TRM solo cambia una vez al día.
//
// Respuesta: { trm: 4200.50, fecha: "2026-05-05" }

const CACHE_TTL = 60 * 60 * 1000; // 1 hora
let cache = { trm: null, fecha: null, ts: 0 };

const FALLBACK_TRM = 4200; // Tasa por defecto si la API falla

async function fetchTRM() {
  const url =
    'https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde%20DESC&$limit=1';

  const resp = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!resp.ok) throw new Error(`datos_gov_http_${resp.status}`);

  const data = await resp.json();
  if (!Array.isArray(data) || !data.length) throw new Error('empty_response');

  const row = data[0];
  const trm = parseFloat(row.valor);
  if (isNaN(trm) || trm <= 0) throw new Error('invalid_trm');

  const fecha = row.vigenciadesde
    ? row.vigenciadesde.slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return { trm, fecha };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end('Method Not Allowed');
  }

  const now = Date.now();

  // Servir desde caché si aún es válido
  if (cache.trm && now - cache.ts < CACHE_TTL) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.end(JSON.stringify({ trm: cache.trm, fecha: cache.fecha }));
  }

  try {
    const result = await fetchTRM();
    cache = { ...result, ts: now };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.end(JSON.stringify(result));
  } catch (err) {
    // Si hay caché antiguo, usarlo
    if (cache.trm) {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ trm: cache.trm, fecha: cache.fecha, stale: true }));
    }
    // Fallback absoluto
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ trm: FALLBACK_TRM, fecha: null, fallback: true }));
  }
}
