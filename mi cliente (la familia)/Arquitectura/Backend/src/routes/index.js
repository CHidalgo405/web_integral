const router = require('express').Router();
const { verifyToken, requireRole, requireExactRole } = require('../middleware/auth.middleware');

// Recursos operativos: contienen datos internos de personal, caja, compras
// y proveedores. El frontend actual solo expone estas funciones al admin.
const adminOnly = [verifyToken, requireRole('admin')];
const operations = [verifyToken, requireRole('admin', 'manager')];
const ownerOnly = [verifyToken, requireExactRole('admin')];
const cashierOrAdmin = [verifyToken, requireRole('admin', 'cashier')];

router.use('/auth',                require('./auth.routes'));
router.use('/shop-config',         require('./shopConfig.routes'));
router.use('/categories',          require('./categories.routes'));
router.use('/units',               require('./units.routes'));
router.use('/suppliers',           ...operations, require('./suppliers.routes'));
router.use('/inventory',           require('./inventory.routes'));
router.use('/purchase-orders',     ...operations, require('./purchaseOrders.routes'));
router.use('/stock-receipts',      ...operations, require('./stockReceipts.routes'));
router.use('/expiration-batches',  ...operations, require('./expirationBatches.routes'));
router.use('/employees',           ...adminOnly, require('./employees.routes'));
router.use('/schedules',           ...adminOnly, require('./schedules.routes'));
router.use('/shift-covers',        ...adminOnly, require('./shiftCovers.routes'));
router.use('/users',               require('./users.routes'));
router.use('/customers',           ...cashierOrAdmin, require('./customers.routes'));
router.use('/delivery-zones',      require('./deliveryZones.routes'));
router.use('/promotions',          require('./promotions.routes'));
router.use('/purchases',           require('./purchases.routes'));
router.use('/returns',             ...adminOnly, require('./purchaseReturns.routes'));
router.use('/expense-categories',  ...ownerOnly, require('./expenseCategories.routes'));
router.use('/expenses',            ...ownerOnly, require('./expenses.routes'));
router.use('/till-movements',      ...ownerOnly, require('./tillMovements.routes'));
router.use('/cash-audit',          ...ownerOnly, require('./cashAudit.routes'));
router.use('/cash-register',       require('./cashRegister.routes'));
router.use('/notifications',       ...adminOnly, require('./notifications.routes'));
router.use('/price-history',       ...adminOnly, require('./priceHistory.routes'));
router.use('/addresses',           require('./userAddresses.routes'));
router.use('/payment-methods',     require('./userPaymentMethods.routes'));
router.use('/paypal',              require('./paypal.routes'));
router.use('/reviews',             require('./reviews.routes'));

module.exports = router;
