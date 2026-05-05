// Vercel Function: consulta el estado de una transacción Wompi por ID.
//
// Query: ?id=<transaction_id>
// Respuesta: { status, reference, amountInCents, currency }
//
// Variables de entorno:
//   WOMPI_ENV — 'production' o 'sandbox' (default: sandbox)

const SANDBOX = 'https://sandbox.wompi.co';
const PRODUCTION = 'https://production.wompi.co';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end('Method Not Allowed');
  }

  const id =
    (req.query && req.query.id) ||
    new URL(req.url, 'http://x').searchParams.get('id');

  if (!id) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'missing_id' }));
  }

  const env = process.env.WOMPI_ENV === 'production' ? 'production' : 'sandbox';
  const base = env === 'production' ? PRODUCTION : SANDBOX;

  try {
    const r = await fetch(`${base}/v1/transactions/${encodeURIComponent(id)}`);
    if (!r.ok) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'wompi_http_' + r.status }));
    }
    const data = await r.json();
    const t = (data && data.data) || {};
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      status: t.status || null,
      reference: t.reference || null,
      amountInCents: t.amount_in_cents || null,
      currency: t.currency || null,
    }));
  } catch (err) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'wompi_failed', detail: String(err && err.message) }));
  }
}
