const db = require('../db');

const get = () =>
  db.query('SELECT * FROM shop_config WHERE id = 1');

const update = ({ shop_name, address, latitude, longitude, currency, express_surcharge, free_shipping_threshold }) =>
  db.query(
    `UPDATE shop_config
     SET shop_name=$1, address=$2, latitude=$3, longitude=$4, currency=$5,
         express_surcharge=$6, free_shipping_threshold=$7
     WHERE id=1 RETURNING *`,
    [shop_name, address, latitude, longitude, currency, express_surcharge ?? 40, free_shipping_threshold ?? null]
  );

module.exports = { get, update };
