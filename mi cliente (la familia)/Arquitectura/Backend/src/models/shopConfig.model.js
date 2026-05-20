const db = require('../db');

const get = () =>
  db.query('SELECT * FROM shop_config WHERE id = 1');

const update = ({ shop_name, address, latitude, longitude, currency }) =>
  db.query(
    `UPDATE shop_config
     SET shop_name=$1, address=$2, latitude=$3, longitude=$4, currency=$5
     WHERE id=1 RETURNING *`,
    [shop_name, address, latitude, longitude, currency]
  );

module.exports = { get, update };
