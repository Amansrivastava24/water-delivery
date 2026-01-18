const express = require('express');
const router = express.Router();
const {
    getCustomerPaymentReport,
    getBulkOrderReport,
    getDeliverySummary,
    exportToCSV
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/customer-payments', getCustomerPaymentReport);
router.get('/bulk-orders', getBulkOrderReport);
router.get('/delivery-summary', getDeliverySummary);
router.get('/export', exportToCSV);

module.exports = router;
