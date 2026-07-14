const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeItems,
  calculateShippingFee,
  allocatePromotion,
} = require('../src/services/checkout.service');

const PRODUCT_A = '11111111-1111-4111-8111-111111111111';
const PRODUCT_B = '22222222-2222-4222-8222-222222222222';

test('checkout normalizes duplicate products and rejects invalid quantities', () => {
  assert.deepEqual(
    normalizeItems([
      { inventory_id: PRODUCT_A, quantity: 2 },
      { inventory_id: PRODUCT_A, quantity: 3 },
      { inventory_id: PRODUCT_B, quantity: 1 },
    ]),
    [
      { inventory_id: PRODUCT_A, quantity: 5 },
      { inventory_id: PRODUCT_B, quantity: 1 },
    ],
  );
  assert.throws(() => normalizeItems([{ inventory_id: PRODUCT_A, quantity: 0 }]), /cantidades/);
  assert.throws(() => normalizeItems([{ inventory_id: 'not-a-uuid', quantity: 1 }]), /productos/);
});

test('shipping prices are calculated only from server rules', () => {
  assert.equal(calculateShippingFee(499.99, 'standard'), 49.99);
  assert.equal(calculateShippingFee(500, 'standard'), 0);
  assert.equal(calculateShippingFee(999, 'express'), 89.99);
  assert.equal(calculateShippingFee(10, 'pickup'), 0);
  assert.throws(() => calculateShippingFee(10, 'overnight'), /inválido/);
});

test('coupon discount is capped and allocated across eligible lines', () => {
  const items = [
    { inventory_id: PRODUCT_A, gross_total: 80, line_total: 80 },
    { inventory_id: PRODUCT_B, gross_total: 20, line_total: 20 },
  ];
  const promotion = {
    id: '33333333-3333-4333-8333-333333333333',
    discount_pct: null,
    discount_fixed: 150,
    inventory_id: null,
  };
  const result = allocatePromotion(items, promotion);
  assert.equal(result.discountTotal, 100);
  assert.equal(result.items.reduce((sum, item) => sum + item.line_total, 0), 0);
  assert.ok(result.items.every((item) => item.promotion_id === promotion.id));
});
