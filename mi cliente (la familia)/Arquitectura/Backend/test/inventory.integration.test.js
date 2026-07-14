const test = require('node:test');
const assert = require('node:assert/strict');

const connectionString = process.env.INVENTORY_TEST_DATABASE_URL || process.env.POS_TEST_DATABASE_URL;

if (!connectionString) {
  test('inventory adjustment records an auditable movement', { skip: true }, () => {});
} else {
  process.env.DATABASE_URL = connectionString;
  const db = require('../src/db');
  const Inventory = require('../src/models/inventory.model');

  test.after(async () => {
    await db.end();
  });

  test('inventory adjustment records an auditable movement', async () => {
    const { rows } = await db.query(
      'SELECT id, stock FROM inventory WHERE active=TRUE ORDER BY created_at LIMIT 1'
    );
    assert.ok(rows.length, 'the test database needs one active inventory item');

    const item = rows[0];
    const initialStock = Number(item.stock);
    const reason = `Automated inventory test ${Date.now()}`;

    try {
      const entry = await Inventory.adjustStock(item.id, {
        quantity_delta: 3,
        reason,
        notes: 'Temporary integration test entry',
        user_id: null,
      });
      assert.equal(entry.previous_stock, initialStock);
      assert.equal(entry.new_stock, initialStock + 3);
      assert.equal(entry.movement_type, 'entry');

      const exit = await Inventory.adjustStock(item.id, {
        quantity_delta: -3,
        reason,
        notes: 'Restore initial stock after test',
        user_id: null,
      });
      assert.equal(exit.new_stock, initialStock);
      assert.equal(exit.movement_type, 'exit');

      const history = await Inventory.findMovements({ inventory_id: item.id, limit: 10 });
      assert.equal(history.rows.filter((movement) => movement.reason === reason).length, 2);
    } finally {
      await db.query('UPDATE inventory SET stock=$1 WHERE id=$2', [initialStock, item.id]);
      await db.query('DELETE FROM inventory_movements WHERE reason=$1', [reason]);
    }
  });
}
