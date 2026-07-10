// Integración con PayPal (REST API v2, fetch nativo de Node 20+).
// Las credenciales viven SOLO en variables de entorno:
//   PAYPAL_CLIENT_ID, PAYPAL_SECRET
//   PAYPAL_API_BASE (opcional; default sandbox)
// En producción real cambiar PAYPAL_API_BASE a https://api-m.paypal.com

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_SECRET;
const CURRENCY = process.env.PAYPAL_CURRENCY || 'MXN';

const isConfigured = () => Boolean(CLIENT_ID && SECRET);

const getAccessToken = async () => {
  const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`PayPal auth failed (${res.status}): ${detail}`);
  }
  const data = await res.json();
  return data.access_token;
};

// Config pública para el frontend (el client id no es secreto)
const config = (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({ error: 'PayPal no está configurado en el servidor' });
  }
  res.json({ clientId: CLIENT_ID, currency: CURRENCY });
};

// Crea la orden en PayPal con el total a cobrar
const createOrder = async (req, res, next) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ error: 'PayPal no está configurado en el servidor' });
    }

    const { total } = req.body;
    const amount = Number(total);
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Total inválido' });
    }

    const accessToken = await getAccessToken();
    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: { currency_code: CURRENCY, value: amount.toFixed(2) },
            description: 'Compra en La Familia',
          },
        ],
      }),
    });

    const order = await orderRes.json();
    if (!orderRes.ok) {
      return res.status(orderRes.status).json({ error: 'No se pudo crear la orden de PayPal', detail: order });
    }

    res.status(201).json({ id: order.id, status: order.status });
  } catch (err) {
    next(err);
  }
};

// Captura el pago de una orden aprobada por el comprador
const captureOrder = async (req, res, next) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ error: 'PayPal no está configurado en el servidor' });
    }

    const { paypalOrderId } = req.body;
    if (!paypalOrderId) {
      return res.status(400).json({ error: 'paypalOrderId es requerido' });
    }

    const accessToken = await getAccessToken();
    const captureRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const capture = await captureRes.json();
    if (!captureRes.ok) {
      return res.status(captureRes.status).json({ error: 'No se pudo capturar el pago', detail: capture });
    }

    const completed = capture.status === 'COMPLETED';
    res.json({
      id: capture.id,
      status: capture.status,
      completed,
      payer_email: capture.payer?.email_address ?? null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { config, createOrder, captureOrder };
