const test = require('node:test');
const assert = require('node:assert/strict');
const { validateUuid, normalizeReviewPayload } = require('../src/services/reviews.service');

test('review payload accepts and trims valid ratings and comments', () => {
  assert.deepEqual(
    normalizeReviewPayload({ rating: '5', comment: '  Excelente producto y servicio.  ' }),
    { rating: 5, comment: 'Excelente producto y servicio.' },
  );
});

test('review payload rejects invalid ratings and comment lengths', () => {
  assert.throws(() => normalizeReviewPayload({ rating: 0, comment: 'Comentario válido' }), /entre 1 y 5/);
  assert.throws(() => normalizeReviewPayload({ rating: 6, comment: 'Comentario válido' }), /entre 1 y 5/);
  assert.throws(() => normalizeReviewPayload({ rating: 4.5, comment: 'Comentario válido' }), /entero/);
  assert.throws(() => normalizeReviewPayload({ rating: 4, comment: 'Corto' }), /10 y 1000/);
  assert.throws(() => normalizeReviewPayload({ rating: 4, comment: 'x'.repeat(1001) }), /10 y 1000/);
});

test('review identifiers must be UUIDs', () => {
  const id = '11111111-1111-4111-8111-111111111111';
  assert.equal(validateUuid(id), id);
  assert.throws(() => validateUuid('producto-1'), /inválido/);
});
