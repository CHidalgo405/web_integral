const Purchases = require('../models/purchases.model');
const PayPal = require('../services/paypal.service');

const config = (req, res) => {
  if (!PayPal.isConfigured()) {
    return res.status(503).json({ error: 'PayPal no está configurado en el servidor' });
  }
  res.json({ clientId: PayPal.CLIENT_ID, currency: PayPal.CURRENCY });
};

const createOrder = async (req, res, next) => {
  try {
    const quote = await Purchases.quoteCheckout(req.user.id, req.body);
    if (quote.total <= 0) return res.status(400).json({ error: 'El total del pedido debe ser mayor a cero' });
    const order = await PayPal.createOrder(quote, req.user.id);
    res.status(201).json({ id: order.id, status: order.status, total: quote.total });
  } catch (err) { next(err); }
};

const captureOrder = async (req, res, next) => {
  try {
    const paypalOrderId = typeof req.body?.paypalOrderId === 'string'
      ? req.body.paypalOrderId.trim()
      : '';
    if (!/^[A-Z0-9-]{10,64}$/i.test(paypalOrderId)) {
      return res.status(400).json({ error: 'paypalOrderId inválido' });
    }
    const capture = await PayPal.captureOrder(paypalOrderId);
    const payment = PayPal.getCompletedPayment(capture);
    if (payment.custom_id !== req.user.id) {
      return res.status(403).json({ error: 'La orden de PayPal no pertenece a esta cuenta' });
    }
    res.json({
      id: capture.id,
      status: capture.status,
      completed: true,
      amount: payment.amount,
      currency: payment.currency,
      payer_email: capture.payer?.email_address ?? null,
    });
  } catch (err) { next(err); }
};

module.exports = { config, createOrder, captureOrder };
