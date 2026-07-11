const test = require('node:test');
const assert = require('node:assert/strict');

const testDatabaseUrl = process.env.POS_TEST_DATABASE_URL;
if (testDatabaseUrl) process.env.DATABASE_URL = testDatabaseUrl;

test('POS opens register, records sale, updates stock and closes register', { skip: !testDatabaseUrl }, async () => {
  const db = require('../src/db');
  const CashRegister = require('../src/models/cashRegister.model');
  const Purchases = require('../src/models/purchases.model');

  try {
    const { rows: [employee] } = await db.query(
      `INSERT INTO employees (first_name, last_name, email, role)
       VALUES ('Integration', 'Cashier', 'pos-integration@test.local', 'cashier') RETURNING id`,
    );
    const { rows: [product] } = await db.query(
      'SELECT id, price, stock FROM inventory WHERE active=TRUE AND stock > 0 ORDER BY name LIMIT 1',
    );

    await CashRegister.open(employee.id, 500, 'morning');
    const opened = await CashRegister.getStatus(employee.id);
    assert.equal(opened.is_open, true);
    assert.equal(opened.expected_cash, 500);

    const sale = await Purchases.createPosSale(
      { employee_id: employee.id, payment_method: 'cash', cash_tendered: 1000 },
      [{ inventory_id: product.id, quantity: 1 }],
    );
    assert.equal(sale.status, 'completed');
    assert.equal(Number(sale.total), Number(product.price));
    assert.equal(Number(sale.change_given), 1000 - Number(product.price));

    const { rows: [updatedProduct] } = await db.query('SELECT stock FROM inventory WHERE id=$1', [product.id]);
    assert.equal(updatedProduct.stock, product.stock - 1);

    const afterSale = await CashRegister.getStatus(employee.id);
    assert.equal(afterSale.sales_count, 1);
    assert.equal(afterSale.expected_cash, 500 + Number(product.price));

    const closeAudit = await CashRegister.close(employee.id, afterSale.expected_cash);
    assert.equal(Number(closeAudit.difference), 0);
    assert.equal((await CashRegister.getStatus(employee.id)).is_open, false);
  } finally {
    await db.end();
  }
});
