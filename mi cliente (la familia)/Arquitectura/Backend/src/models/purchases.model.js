const db = require('../db');
const { distanceKm, selectZone, feeFor } = require('../utils/delivery');

const findAll = ({ date, employee_id, status, user_id } = {}) => {
  const conditions = [];
  const params = [];
  if (date)        conditions.push(`DATE(p.created_at)=$${params.push(date)}`);
  if (employee_id) conditions.push(`p.employee_id=$${params.push(employee_id)}`);
  if (status)      conditions.push(`p.status=$${params.push(status)}`);
  if (user_id)     conditions.push(`p.user_id=$${params.push(user_id)}`);
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return db.query(
    `SELECT p.*, e.first_name, e.last_name, c.name AS customer_name,
            ue.first_name AS user_first_name, ue.last_name AS user_last_name,
            u.username AS user_email
     FROM purchases p
     LEFT JOIN employees e ON e.id = p.employee_id
     LEFT JOIN customers c ON c.id = p.customer_id
     LEFT JOIN users u ON u.id = p.user_id
     LEFT JOIN employees ue ON ue.id = u.employee_id
     ${where} ORDER BY p.created_at DESC`,
    params
  );
};

const findById = (id) =>
  db.query(
    `SELECT p.*, e.first_name, e.last_name, c.name AS customer_name
     FROM purchases p
     LEFT JOIN employees e ON e.id = p.employee_id
     LEFT JOIN customers c ON c.id = p.customer_id
     WHERE p.id=$1`,
    [id]
  );

const findItems = (purchase_id) =>
  db.query(
    `SELECT pi.*, i.name AS inventory_name, i.sku
     FROM purchase_items pi
     JOIN inventory i ON i.id = pi.inventory_id
     WHERE pi.purchase_id=$1`,
    [purchase_id]
  );

const createWithItems = async (purchase, items) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const quantities = new Map();
    for (const item of items) { const quantity=Number(item.quantity); if(!item.inventory_id||!Number.isInteger(quantity)||quantity<=0) throw Object.assign(new Error('Productos o cantidades inválidos'),{status:400}); quantities.set(item.inventory_id,(quantities.get(item.inventory_id)||0)+quantity); }
    const ids=[...quantities.keys()];
    const { rows: products } = await client.query(
      `SELECT i.id,i.name,i.price,i.stock,i.active,p.id AS promotion_id,p.discount_pct,p.discount_fixed
       FROM inventory i LEFT JOIN LATERAL (SELECT * FROM promotions p WHERE p.inventory_id=i.id AND p.active=TRUE AND (p.valid_from IS NULL OR p.valid_from<=CURRENT_DATE) AND (p.valid_until IS NULL OR p.valid_until>=CURRENT_DATE) ORDER BY p.created_at DESC LIMIT 1) p ON TRUE
       WHERE i.id=ANY($1::uuid[]) FOR UPDATE OF i`, [ids]
    );
    if(products.length!==ids.length)throw Object.assign(new Error('Uno de los productos no existe'),{status:400});
    const byId=new Map(products.map(product=>[product.id,product]));
    items=ids.map(id=>{const product=byId.get(id);const quantity=quantities.get(id);if(!product.active)throw Object.assign(new Error(`${product.name} no está disponible`),{status:409});if(Number(product.stock)<quantity)throw Object.assign(new Error(`Stock insuficiente para ${product.name}`),{status:409});const price=Number(product.price);const unitDiscount=product.discount_pct!=null?price*Number(product.discount_pct)/100:Math.min(price,Number(product.discount_fixed||0));return{inventory_id:id,quantity,unit_price:price,promotion_id:product.promotion_id||null,discount_pct:price?unitDiscount/price*100:0,line_total:Number(((price-unitDiscount)*quantity).toFixed(2)),discount_total:Number((unitDiscount*quantity).toFixed(2))};});
    purchase.subtotal=Number(items.reduce((sum,item)=>sum+item.unit_price*item.quantity,0).toFixed(2));purchase.discount_total=Number(items.reduce((sum,item)=>sum+item.discount_total,0).toFixed(2));
    let deliveryFee=0;
    if(purchase.delivery_method==='home_delivery'){
      const {rows:addresses}=await client.query('SELECT * FROM user_addresses WHERE id=$1 AND user_id=$2',[purchase.address_id,purchase.user_id]);const address=addresses[0];
      if(!address||address.latitude==null||address.longitude==null)throw Object.assign(new Error('Confirma la ubicación de la dirección'),{status:409,appCode:'ADDRESS_LOCATION_REQUIRED'});
      const {rows:configs}=await client.query('SELECT * FROM shop_config WHERE id=1');const config=configs[0];if(!config||config.latitude==null||config.longitude==null)throw Object.assign(new Error('La ubicación de tienda no está configurada'),{status:409,appCode:'SHOP_LOCATION_REQUIRED'});
      const distance=distanceKm(Number(config.latitude),Number(config.longitude),Number(address.latitude),Number(address.longitude));const {rows:zones}=await client.query('SELECT * FROM delivery_zones WHERE active=TRUE ORDER BY min_km');const zone=selectZone(zones,distance);
      if(!zone)throw Object.assign(new Error('La dirección está fuera del área de entrega'),{status:409,appCode:'DELIVERY_OUT_OF_RANGE'});
      deliveryFee=feeFor(zone,distance);if(purchase.shipping_method==='standard'&&config.free_shipping_threshold!=null&&purchase.subtotal>=Number(config.free_shipping_threshold))deliveryFee=0;if(purchase.shipping_method==='express')deliveryFee+=Number(config.express_surcharge||0);
      purchase.delivery_distance_km=Number(distance.toFixed(2));purchase.delivery_zone_id=zone.id;purchase.delivery_address=[address.street,address.exterior_number,address.neighborhood,address.city,address.state,address.zip_code].filter(Boolean).join(', ');
    }
    purchase.delivery_fee=Number(deliveryFee.toFixed(2));purchase.total=Number((purchase.subtotal-purchase.discount_total+purchase.delivery_fee).toFixed(2));

    const { rows: [p] } = await client.query(
      `INSERT INTO purchases
         (customer_id, employee_id, user_id, delivery_method, delivery_address,
          delivery_distance_km, delivery_zone_id, delivery_fee,
          payment_method, status, subtotal, discount_total, total, cash_tendered,
          paypal_order_id, paid_at, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [
        purchase.customer_id ?? null,
        purchase.employee_id ?? null,
        purchase.user_id ?? null,
        purchase.delivery_method ?? 'on_spot',
        purchase.delivery_address ?? null,
        purchase.delivery_distance_km ?? null,
        purchase.delivery_zone_id ?? null,
        purchase.delivery_fee ?? 0,
        purchase.payment_method,
        purchase.status ?? 'completed',
        purchase.subtotal,
        purchase.discount_total ?? 0,
        purchase.total,
        purchase.cash_tendered ?? null,
        purchase.paypal_order_id ?? null,
        purchase.paid_at ?? null,
        purchase.notes ?? null,
      ]
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO purchase_items
           (purchase_id, inventory_id, promotion_id, quantity, unit_price, discount_pct, line_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [p.id, item.inventory_id, item.promotion_id ?? null, item.quantity, item.unit_price, item.discount_pct ?? 0, item.line_total]
      );
    }

    await client.query('COMMIT');
    return p;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const createPosSale = async (sale, requestedItems) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { rows: audits } = await client.query(
      `SELECT audit_type, shift, created_at FROM cash_audit
       WHERE employee_id=$1 AND created_at::date=CURRENT_DATE
       ORDER BY created_at DESC LIMIT 1`,
      [sale.employee_id],
    );
    const register = audits[0];
    if (!register || register.audit_type !== 'open') {
      const err = new Error('Debes abrir la caja antes de registrar una venta');
      err.status = 409;
      throw err;
    }

    const ids = requestedItems.map((item) => item.inventory_id);
    const { rows: inventoryRows } = await client.query(
      `SELECT id, name, sku, price, stock, active
       FROM inventory WHERE id=ANY($1::uuid[]) FOR UPDATE`,
      [ids],
    );
    const inventoryById = new Map(inventoryRows.map((item) => [item.id, item]));

    const items = requestedItems.map((requested) => {
      const product = inventoryById.get(requested.inventory_id);
      if (!product || !product.active) {
        const err = new Error('Uno de los productos no existe o está inactivo');
        err.status = 400;
        throw err;
      }
      if (Number(product.stock) < requested.quantity) {
        const err = new Error(`Stock insuficiente para ${product.name}`);
        err.status = 409;
        throw err;
      }
      const unitPrice = Number(product.price);
      const lineTotal = Math.round(unitPrice * requested.quantity * 100) / 100;
      return {
        inventory_id: product.id,
        inventory_name: product.name,
        sku: product.sku,
        quantity: requested.quantity,
        unit_price: unitPrice,
        discount_pct: 0,
        line_total: lineTotal,
      };
    });

    const subtotal = Math.round(items.reduce((sum, item) => sum + item.line_total, 0) * 100) / 100;
    const cashTendered = sale.payment_method === 'cash' ? Number(sale.cash_tendered) : null;
    if (sale.payment_method === 'cash' && (!Number.isFinite(cashTendered) || cashTendered < subtotal)) {
      const err = new Error('El efectivo recibido es menor al total');
      err.status = 400;
      throw err;
    }

    const { rows: [purchase] } = await client.query(
      `INSERT INTO purchases
         (customer_id, employee_id, delivery_method, delivery_fee, payment_method,
          status, subtotal, discount_total, total, cash_tendered, paid_at, notes)
       VALUES ($1,$2,'on_spot',0,$3,'completed',$4,0,$4,$5,NOW(),$6)
       RETURNING *`,
      [sale.customer_id ?? null, sale.employee_id, sale.payment_method, subtotal, cashTendered, sale.notes ?? null],
    );

    for (const item of items) {
      const { rows: [savedItem] } = await client.query(
        `INSERT INTO purchase_items
           (purchase_id, inventory_id, quantity, unit_price, discount_pct, line_total)
         VALUES ($1,$2,$3,$4,0,$5) RETURNING id`,
        [purchase.id, item.inventory_id, item.quantity, item.unit_price, item.line_total],
      );
      item.id = savedItem.id;
    }

    if (sale.payment_method === 'cash') {
      await client.query(
        `INSERT INTO till_movements
           (employee_id, shift, movement_type, amount, reference_id, notes)
         VALUES ($1,$2,'sale',$3,$4,'Venta en punto de venta')`,
        [sale.employee_id, register.shift, subtotal, purchase.id],
      );
    }

    await client.query('COMMIT');
    return { ...purchase, items };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateStatus = (id, status, tracking_number) => {
  if (tracking_number !== undefined) {
    return db.query(
      'UPDATE purchases SET status=$1, tracking_number=$2 WHERE id=$3 RETURNING *',
      [status, tracking_number, id]
    );
  }
  return db.query('UPDATE purchases SET status=$1 WHERE id=$2 RETURNING *', [status, id]);
};

// Agregados para el dashboard admin
const metrics = async () => {
  const [totals, daily, topProducts, byStatus, usersCount] = await Promise.all([
    db.query(
      `SELECT
         COUNT(*)::int AS total_orders,
         COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_orders,
         COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'), 0) AS total_sales,
         COALESCE(AVG(total) FILTER (WHERE status <> 'cancelled'), 0) AS avg_ticket,
         COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled' AND created_at::date = CURRENT_DATE), 0) AS sales_today,
         COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled' AND created_at >= date_trunc('week', NOW())), 0) AS sales_week,
         COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled' AND created_at >= date_trunc('month', NOW())), 0) AS sales_month
       FROM purchases`
    ),
    db.query(
      `SELECT d.day::date AS day,
              COALESCE(SUM(p.total) FILTER (WHERE p.status <> 'cancelled'), 0) AS sales,
              COUNT(p.id) FILTER (WHERE p.status <> 'cancelled')::int AS orders
       FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') AS d(day)
       LEFT JOIN purchases p ON p.created_at::date = d.day::date
       GROUP BY d.day ORDER BY d.day`
    ),
    db.query(
      `SELECT i.id, i.name,
              SUM(pi.quantity)::int AS units_sold,
              COALESCE(SUM(pi.line_total), 0) AS revenue
       FROM purchase_items pi
       JOIN purchases p ON p.id = pi.purchase_id AND p.status <> 'cancelled'
       JOIN inventory i ON i.id = pi.inventory_id
       GROUP BY i.id, i.name
       ORDER BY units_sold DESC
       LIMIT 5`
    ),
    db.query(
      `SELECT status, COUNT(*)::int AS count FROM purchases GROUP BY status`
    ),
    db.query(`SELECT COUNT(*)::int AS count FROM users WHERE active = TRUE`),
  ]);

  return {
    ...totals.rows[0],
    daily: daily.rows,
    top_products: topProducts.rows,
    by_status: byStatus.rows,
    active_users: usersCount.rows[0].count,
  };
};

module.exports = { findAll, findById, findItems, createWithItems, createPosSale, updateStatus, metrics };
