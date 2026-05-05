// Vercel Function: calcula la firma de integridad de Wompi server-side.
// El integrity-secret nunca llega al cliente.
//
// Body JSON: { reference, amountInCents, currency }
// Respuesta: { signature }
//
// Variable de entorno requerida:
//   WOMPI_INTEGRITY_SECRET — secreto de integridad del comercio Wompi.
import crypto from 'node:crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end('Method Not Allowed');
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'invalid_body' }));
  }

  const { reference, amountInCents, currency } = body;
  if (!reference || !amountInCents || !currency) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'missing_fields' }));
  }

  const integrity = process.env.WOMPI_INTEGRITY_SECRET;
  if (!integrity) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'missing_env', missing: ['WOMPI_INTEGRITY_SECRET'] }));
  }

  const concat = `${reference}${amountInCents}${currency}${integrity}`;
  const signature = crypto.createHash('sha256').update(concat).digest('hex');

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({ signature }));
}
