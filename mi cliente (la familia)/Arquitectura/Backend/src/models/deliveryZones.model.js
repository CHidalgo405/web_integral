const db = require('../db');

const findAll = () =>
  db.query('SELECT * FROM delivery_zones WHERE active=TRUE ORDER BY min_km');

const findById = (id) =>
  db.query('SELECT * FROM delivery_zones WHERE id=$1', [id]);

const calculateFee = (distance_km) =>
  db.query('SELECT calculate_delivery_fee($1) AS fee', [distance_km]);

const getCoverageData = async () => {
  const [config, zones] = await Promise.all([
    db.query('SELECT * FROM shop_config WHERE id=1'),
    db.query('SELECT * FROM delivery_zones WHERE active=TRUE ORDER BY min_km'),
  ]);
  return { config: config.rows[0], zones: zones.rows };
};

const findAudit = (zone_id) =>
  db.query(
    'SELECT * FROM delivery_zone_audit WHERE zone_id=$1 ORDER BY changed_at DESC',
    [zone_id]
  );

const create = ({ name, min_km, max_km, base_fee, fee_per_km }) =>
  db.query(
    `INSERT INTO delivery_zones (name, min_km, max_km, base_fee, fee_per_km)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name, min_km ?? 0, max_km, base_fee, fee_per_km ?? 0]
  );

const update = (id, { name, min_km, max_km, base_fee, fee_per_km, active, updated_by }) =>
  db.query(
    `UPDATE delivery_zones
     SET name=$1, min_km=$2, max_km=$3, base_fee=$4, fee_per_km=$5, active=$6, updated_by=$7
     WHERE id=$8 RETURNING *`,
    [name, min_km, max_km, base_fee, fee_per_km, active ?? true, updated_by ?? null, id]
  );

const remove = (id) =>
  db.query('UPDATE delivery_zones SET active=FALSE WHERE id=$1 RETURNING id', [id]);

module.exports = { findAll, findById, calculateFee, getCoverageData, findAudit, create, update, remove };
