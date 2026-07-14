const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_SECRET;
const CURRENCY = process.env.PAYPAL_CURRENCY || 'MXN';

const isConfigured = () => Boolean(CLIENT_ID && SECRET);

const serviceError = (message, status = 502) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getAccessToken = async () => {
  if (!isConfigured()) throw serviceError('PayPal no está configurado en el servidor', 503);
  const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) throw serviceError(`PayPal rechazó la autenticación (${response.status})`);
  return (await response.json()).access_token;
};

const paypalRequest = async (path, options = {}) => {
  const accessToken = await getAccessToken();
  const response = await fetch(`${PAYPAL_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw serviceError(`PayPal rechazó la operación (${response.status})`);
  return data;
};

const createOrder = (quote, userId) => paypalRequest('/v2/checkout/orders', {
  method: 'POST',
  body: JSON.stringify({
    intent: 'CAPTURE',
    purchase_units: [{
      custom_id: userId,
      amount: { currency_code: CURRENCY, value: quote.total.toFixed(2) },
      description: 'Compra en La Familia',
    }],
  }),
});

const captureOrder = (paypalOrderId) => paypalRequest(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
  method: 'POST',
});

const getOrder = (paypalOrderId) => paypalRequest(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`);

const getCompletedPayment = (order) => {
  const unit = order?.purchase_units?.[0];
  const capture = unit?.payments?.captures?.find((candidate) => candidate.status === 'COMPLETED');
  if (order?.status !== 'COMPLETED' || !capture?.amount) {
    throw serviceError('El pago de PayPal no está completado', 409);
  }
  return {
    status: capture.status,
    amount: Number(capture.amount.value),
    currency: capture.amount.currency_code,
    custom_id: unit.custom_id ?? null,
    paid_at: capture.create_time ?? new Date().toISOString(),
  };
};

module.exports = {
  CURRENCY,
  CLIENT_ID,
  isConfigured,
  createOrder,
  captureOrder,
  getOrder,
  getCompletedPayment,
};
