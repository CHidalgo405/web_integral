const db = require('../db');

const findAll = ({ unseen_only } = {}) => {
  const where = unseen_only ? 'WHERE seen=FALSE' : '';
  return db.query(`SELECT * FROM notifications ${where} ORDER BY created_at DESC`);
};

const findById = (id) =>
  db.query('SELECT * FROM notifications WHERE id=$1', [id]);

const create = ({ type, reference_id, message }) =>
  db.query(
    'INSERT INTO notifications (type, reference_id, message) VALUES ($1,$2,$3) RETURNING *',
    [type, reference_id ?? null, message]
  );

const markSeen = (id, user_id) =>
  db.query(
    `UPDATE notifications SET seen=TRUE, seen_by=$1, seen_at=NOW() WHERE id=$2 RETURNING *`,
    [user_id, id]
  );

const markAllSeen = (user_id) =>
  db.query(
    `UPDATE notifications SET seen=TRUE, seen_by=$1, seen_at=NOW() WHERE seen=FALSE RETURNING id`,
    [user_id]
  );

module.exports = { findAll, findById, create, markSeen, markAllSeen };
