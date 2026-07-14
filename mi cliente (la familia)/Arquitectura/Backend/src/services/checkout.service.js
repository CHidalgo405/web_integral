const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHIPPING_METHODS = new Set(['standard', 'express', 'pickup']);
const STANDARD_SHIPPING_FEE = 49.99;
const EXPRESS_SHIPPING_FEE = 89.99;
const FREE_SHIPPING_THRESHOLD = 500;

const checkoutError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const money = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const normalizeItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw checkoutError('Agrega al menos un producto');
  }
  if (items.length > 100) {
    throw checkoutError('El pedido excede el máximo de productos distintos');
  }

  const quantities = new Map();
  for (const item of items) {
    const inventoryId = item?.inventory_id;
    const quantity = Number(item?.quantity);
    if (!UUID_PATTERN.test(inventoryId || '') || !Number.isInteger(quantity) || quantity <= 0 || quantity > 1000) {
      throw checkoutError('Los productos y cantidades deben ser válidos');
    }
    const accumulated = (quantities.get(inventoryId) ?? 0) + quantity;
    if (accumulated > 1000) throw checkoutError('La cantidad solicitada de un producto es demasiado alta');
    quantities.set(inventoryId, accumulated);
  }

  return [...quantities].map(([inventory_id, quantity]) => ({ inventory_id, quantity }));
};

const calculateShippingFee = (subtotal, shippingMethod) => {
  if (!SHIPPING_METHODS.has(shippingMethod)) throw checkoutError('Método de envío inválido');
  if (shippingMethod === 'pickup') return 0;
  if (shippingMethod === 'express') return EXPRESS_SHIPPING_FEE;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
};

const formatAddress = (address) => {
  const street = [address.street, address.exterior_number, address.interior_number && `Int. ${address.interior_number}`]
    .filter(Boolean).join(' ');
  const locality = [address.neighborhood, address.city, address.state, address.zip_code]
    .filter(Boolean).join(', ');
  return [address.full_name, street, locality, address.phone && `Tel. ${address.phone}`]
    .filter(Boolean).join(' | ');
};

const allocatePromotion = (items, promotion) => {
  if (!promotion) return { items, discountTotal: 0 };

  const eligible = items.filter((item) => !promotion.inventory_id || promotion.inventory_id === item.inventory_id);
  if (!eligible.length) throw checkoutError('El cupón no aplica a los productos del carrito');

  const eligibleSubtotal = money(eligible.reduce((sum, item) => sum + item.gross_total, 0));
  const percentage = promotion.discount_pct == null ? 0 : Number(promotion.discount_pct);
  const fixed = promotion.discount_fixed == null ? 0 : Number(promotion.discount_fixed);
  const discountTotal = money(Math.min(
    eligibleSubtotal,
    percentage > 0 ? eligibleSubtotal * percentage / 100 : fixed,
  ));
  if (discountTotal <= 0 || eligibleSubtotal <= 0) {
    return { items, discountTotal: 0 };
  }

  let allocated = 0;
  const lastEligibleId = eligible[eligible.length - 1].inventory_id;
  const discountedItems = items.map((item) => {
    if (!eligible.includes(item)) return item;
    const lineDiscount = item.inventory_id === lastEligibleId
      ? money(discountTotal - allocated)
      : money(discountTotal * item.gross_total / eligibleSubtotal);
    allocated = money(allocated + lineDiscount);
    return {
      ...item,
      promotion_id: promotion.id,
      discount_pct: percentage > 0 ? percentage : 0,
      line_total: money(item.gross_total - lineDiscount),
    };
  });

  return { items: discountedItems, discountTotal };
};

const buildCheckoutQuote = async (client, userId, payload, { lock = false } = {}) => {
  const requestedItems = normalizeItems(payload?.items);
  const shippingMethod = payload?.shipping_method;
  if (!SHIPPING_METHODS.has(shippingMethod)) throw checkoutError('Método de envío inválido');

  const ids = requestedItems.map((item) => item.inventory_id);
  const inventoryResult = await client.query(
    `SELECT id, name, sku, price, stock, active
     FROM inventory
     WHERE id=ANY($1::uuid[])
     ${lock ? 'FOR UPDATE' : ''}`,
    [ids],
  );
  const inventoryById = new Map(inventoryResult.rows.map((item) => [item.id, item]));

  let items = requestedItems.map((requested) => {
    const product = inventoryById.get(requested.inventory_id);
    if (!product || !product.active) throw checkoutError('Uno de los productos no existe o está inactivo');
    if (Number(product.stock) < requested.quantity) {
      throw checkoutError(`Stock insuficiente para ${product.name}`, 409);
    }
    const unitPrice = money(product.price);
    const grossTotal = money(unitPrice * requested.quantity);
    return {
      inventory_id: product.id,
      inventory_name: product.name,
      sku: product.sku,
      quantity: requested.quantity,
      unit_price: unitPrice,
      gross_total: grossTotal,
      promotion_id: null,
      discount_pct: 0,
      line_total: grossTotal,
    };
  });

  const subtotal = money(items.reduce((sum, item) => sum + item.gross_total, 0));
  const couponCode = typeof payload?.coupon_code === 'string' ? payload.coupon_code.trim() : '';
  let promotion = null;
  if (couponCode) {
    if (couponCode.length > 120) throw checkoutError('Cupón inválido');
    const promotionResult = await client.query(
      `SELECT id, name, discount_pct, discount_fixed, inventory_id
       FROM promotions
       WHERE active=TRUE
         AND UPPER(TRIM(name))=UPPER($1)
         AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
         AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
       ORDER BY created_at DESC
       LIMIT 1`,
      [couponCode],
    );
    promotion = promotionResult.rows[0] ?? null;
    if (!promotion) throw checkoutError('Cupón inválido o expirado');
  }

  const promoted = allocatePromotion(items, promotion);
  items = promoted.items;
  const deliveryFee = calculateShippingFee(subtotal, shippingMethod);

  let address = null;
  if (shippingMethod !== 'pickup') {
    if (!UUID_PATTERN.test(payload?.address_id || '')) throw checkoutError('Selecciona una dirección válida');
    const addressResult = await client.query(
      `SELECT id, full_name, phone, street, exterior_number, interior_number,
              neighborhood, city, state, zip_code
       FROM user_addresses WHERE id=$1 AND user_id=$2`,
      [payload.address_id, userId],
    );
    address = addressResult.rows[0] ?? null;
    if (!address) throw checkoutError('La dirección no existe o no pertenece a tu cuenta', 404);
  }

  return {
    items,
    shipping_method: shippingMethod,
    delivery_method: shippingMethod === 'pickup' ? 'pickup' : 'home_delivery',
    address_id: address?.id ?? null,
    delivery_address: address ? formatAddress(address) : null,
    customer_name: address?.full_name ?? null,
    customer_phone: address?.phone ?? null,
    coupon_code: promotion?.name ?? null,
    subtotal,
    discount_total: promoted.discountTotal,
    delivery_fee: deliveryFee,
    total: money(Math.max(0, subtotal - promoted.discountTotal + deliveryFee)),
  };
};

module.exports = {
  UUID_PATTERN,
  checkoutError,
  money,
  normalizeItems,
  calculateShippingFee,
  allocatePromotion,
  buildCheckoutQuote,
};
