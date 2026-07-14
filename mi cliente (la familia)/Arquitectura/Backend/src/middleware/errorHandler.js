const errorHandler = (err, req, res, next) => {
  if (err.code === 'P0001' && err.message.includes('insufficient_stock')) {
    return res.status(409).json({ error: 'Existencias insuficientes', detail: err.message });
  }
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Registro duplicado', detail: err.detail });
  }
  if (err.code === '23503') {
    return res.status(409).json({ error: 'No se encontró el registro relacionado', detail: err.detail });
  }
  if (err.code === '23514') {
    return res.status(400).json({ error: 'Los datos no cumplen las restricciones', detail: err.detail });
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal server error', ...(err.appCode ? { code: err.appCode } : {}) });
};

module.exports = errorHandler;
