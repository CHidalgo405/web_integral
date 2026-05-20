const db = require('../db');

const findAll = () =>
  db.query('SELECT * FROM v_price_history LIMIT 200');

const findByInventory = (inventory_id) =>
  db.query(
    'SELECT * FROM price_history WHERE inventory_id=$1 ORDER BY changed_at DESC',
    [inventory_id]
  );

module.exports = { findAll, findByInventory };
