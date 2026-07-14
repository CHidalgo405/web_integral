const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validateUuid = (value, label = 'Identificador') => {
  if (!UUID_PATTERN.test(String(value ?? ''))) {
    const error = new Error(`${label} inválido`);
    error.status = 400;
    throw error;
  }
  return value;
};

const normalizeReviewPayload = (payload = {}) => {
  const rating = Number(payload.rating);
  const comment = typeof payload.comment === 'string' ? payload.comment.trim() : '';

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    const error = new Error('La calificación debe ser un número entero entre 1 y 5');
    error.status = 400;
    throw error;
  }
  if (comment.length < 10 || comment.length > 1000) {
    const error = new Error('La reseña debe tener entre 10 y 1000 caracteres');
    error.status = 400;
    throw error;
  }

  return { rating, comment };
};

module.exports = { validateUuid, normalizeReviewPayload };
