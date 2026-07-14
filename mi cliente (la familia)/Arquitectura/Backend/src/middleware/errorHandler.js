const errorHandler = (err, req, res, next) => {
  if (err.code === 'P0001' && err.message.includes('insufficient_stock')) {
    return res.status(409).json({ error: 'Insufficient stock', detail: err.message });
  }
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry', detail: err.detail });
  }
  if (err.code === '23503') {
    return res.status(409).json({ error: 'Referenced record not found', detail: err.detail });
  }
  if (err.code === '23514') {
    return res.status(400).json({ error: 'Constraint violation', detail: err.detail });
  }
  console.error('[ErrorHandler]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
};

module.exports = errorHandler;
