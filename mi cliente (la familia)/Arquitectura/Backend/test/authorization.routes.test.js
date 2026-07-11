const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'authorization-test-secret';

const routes = require('../src/routes');

const app = express();
app.use(express.json());
app.use('/api', routes);

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

const customerToken = jwt.sign(
  { id: '00000000-0000-0000-0000-000000000001', username: 'customer@test.local', role: 'customer' },
  process.env.JWT_SECRET,
  { expiresIn: '5m' },
);

const cashierToken = jwt.sign(
  {
    id: '00000000-0000-0000-0000-000000000002',
    employee_id: '00000000-0000-0000-0000-000000000102',
    username: 'cashier@test.local',
    role: 'cashier',
  },
  process.env.JWT_SECRET,
  { expiresIn: '5m' },
);

const request = (path, { method = 'GET', token, body } = {}) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

test('business endpoints reject unauthenticated requests', async () => {
  const cases = [
    ['/shop-config'],
    ['/categories'],
    ['/units'],
    ['/inventory'],
    ['/suppliers'],
    ['/purchase-orders'],
    ['/stock-receipts'],
    ['/expiration-batches'],
    ['/employees'],
    ['/schedules'],
    ['/shift-covers'],
    ['/users'],
    ['/customers'],
    ['/delivery-zones'],
    ['/promotions'],
    ['/purchases'],
    ['/purchases/mine'],
    ['/returns'],
    ['/expense-categories'],
    ['/expenses'],
    ['/till-movements'],
    ['/cash-audit'],
    ['/cash-register/status'],
    ['/notifications'],
    ['/price-history'],
    ['/addresses'],
    ['/payment-methods'],
    ['/paypal/config'],
    ['/paypal/create-order', { method: 'POST', body: { total: 10 } }],
  ];

  for (const [path, options] of cases) {
    const response = await request(path, options);
    assert.equal(response.status, 403, `${path} should require authentication`);
  }
});

test('customer tokens cannot mutate catalog or access internal resources', async () => {
  const cases = [
    ['/inventory', { method: 'POST', body: {}, token: customerToken }],
    ['/categories', { method: 'POST', body: {}, token: customerToken }],
    ['/suppliers', { token: customerToken }],
    ['/purchase-orders', { token: customerToken }],
    ['/stock-receipts', { token: customerToken }],
    ['/employees', { token: customerToken }],
    ['/customers', { token: customerToken }],
    ['/expenses', { token: customerToken }],
    ['/cash-audit', { token: customerToken }],
    ['/notifications', { token: customerToken }],
    ['/price-history', { token: customerToken }],
    ['/purchases', { token: customerToken }],
    ['/purchases/pos', { method: 'POST', body: {}, token: customerToken }],
    ['/users/cashiers', { method: 'POST', body: {}, token: customerToken }],
    ['/cash-register/status', { token: customerToken }],
    ['/notifications', { method: 'POST', body: {}, token: customerToken }],
  ];

  for (const [path, options] of cases) {
    const response = await request(path, options);
    assert.equal(response.status, 403, `${path} should require the admin role`);
  }
});

test('cashier role reaches POS validation but remains blocked from admin resources', async () => {
  const posResponse = await request('/purchases/pos', {
    method: 'POST',
    token: cashierToken,
    body: { items: [], payment_method: 'cash' },
  });
  assert.equal(posResponse.status, 400);

  const openResponse = await request('/cash-register/open', {
    method: 'POST',
    token: cashierToken,
    body: { opening_amount: -1 },
  });
  assert.equal(openResponse.status, 400);

  const adminResponse = await request('/suppliers', { token: cashierToken });
  assert.equal(adminResponse.status, 403);
});
