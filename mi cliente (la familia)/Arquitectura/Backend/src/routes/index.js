const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// Recursos operativos: contienen datos internos de personal, caja, compras
// y proveedores. El frontend actual solo expone estas funciones al admin.
const adminOnly = [verifyToken, requireRole('admin')];

router.use('/auth',                require('./auth.routes'));
router.use('/shop-config',         require('./shopConfig.routes'));
router.use('/categories',          require('./categories.routes'));
router.use('/units',               require('./units.routes'));
router.use('/suppliers',           ...adminOnly, require('./suppliers.routes'));
router.use('/inventory',           require('./inventory.routes'));
router.use('/purchase-orders',     ...adminOnly, require('./purchaseOrders.routes'));
router.use('/stock-receipts',      ...adminOnly, require('./stockReceipts.routes'));
router.use('/expiration-batches',  ...adminOnly, require('./expirationBatches.routes'));
router.use('/employees',           ...adminOnly, require('./employees.routes'));
router.use('/schedules',           ...adminOnly, require('./schedules.routes'));
router.use('/shift-covers',        ...adminOnly, require('./shiftCovers.routes'));
router.use('/users',               require('./users.routes'));
router.use('/customers',           ...adminOnly, require('./customers.routes'));
router.use('/delivery-zones',      require('./deliveryZones.routes'));
router.use('/promotions',          require('./promotions.routes'));
router.use('/purchases',           require('./purchases.routes'));
router.use('/returns',             ...adminOnly, require('./purchaseReturns.routes'));
router.use('/expense-categories',  ...adminOnly, require('./expenseCategories.routes'));
router.use('/expenses',            ...adminOnly, require('./expenses.routes'));
router.use('/till-movements',      ...adminOnly, require('./tillMovements.routes'));
router.use('/cash-audit',          ...adminOnly, require('./cashAudit.routes'));
router.use('/notifications',       ...adminOnly, require('./notifications.routes'));
router.use('/price-history',       ...adminOnly, require('./priceHistory.routes'));
router.use('/addresses',           require('./userAddresses.routes'));
router.use('/payment-methods',     require('./userPaymentMethods.routes'));
router.use('/paypal',              require('./paypal.routes'));

module.exports = router;
