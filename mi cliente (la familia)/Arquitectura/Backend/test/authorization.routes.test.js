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

const cashierToken = jwt.sign(
  { id: '00000000-0000-0000-0000-000000000001', username: 'customer@test.local', role: 'cashier' },
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
    ['/inventory', { method: 'POST', body: {}, token: cashierToken }],
    ['/categories', { method: 'POST', body: {}, token: cashierToken }],
    ['/suppliers', { token: cashierToken }],
    ['/purchase-orders', { token: cashierToken }],
    ['/stock-receipts', { token: cashierToken }],
    ['/employees', { token: cashierToken }],
    ['/customers', { token: cashierToken }],
    ['/expenses', { token: cashierToken }],
    ['/cash-audit', { token: cashierToken }],
    ['/notifications', { token: cashierToken }],
    ['/price-history', { token: cashierToken }],
    ['/purchases', { token: cashierToken }],
    ['/notifications', { method: 'POST', body: {}, token: cashierToken }],
  ];

  for (const [path, options] of cases) {
    const response = await request(path, options);
    assert.equal(response.status, 403, `${path} should require the admin role`);
  }
});
