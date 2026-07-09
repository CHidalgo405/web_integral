const router = require('express').Router();

router.use('/auth',                require('./auth.routes'));
router.use('/shop-config',         require('./shopConfig.routes'));
router.use('/categories',          require('./categories.routes'));
router.use('/units',               require('./units.routes'));
router.use('/suppliers',           require('./suppliers.routes'));
router.use('/inventory',           require('./inventory.routes'));
router.use('/purchase-orders',     require('./purchaseOrders.routes'));
router.use('/stock-receipts',      require('./stockReceipts.routes'));
router.use('/expiration-batches',  require('./expirationBatches.routes'));
router.use('/employees',           require('./employees.routes'));
router.use('/schedules',           require('./schedules.routes'));
router.use('/shift-covers',        require('./shiftCovers.routes'));
router.use('/users',               require('./users.routes'));
router.use('/customers',           require('./customers.routes'));
router.use('/delivery-zones',      require('./deliveryZones.routes'));
router.use('/promotions',          require('./promotions.routes'));
router.use('/purchases',           require('./purchases.routes'));
router.use('/returns',             require('./purchaseReturns.routes'));
router.use('/expense-categories',  require('./expenseCategories.routes'));
router.use('/expenses',            require('./expenses.routes'));
router.use('/till-movements',      require('./tillMovements.routes'));
router.use('/cash-audit',          require('./cashAudit.routes'));
router.use('/notifications',       require('./notifications.routes'));
router.use('/price-history',       require('./priceHistory.routes'));

module.exports = router;
