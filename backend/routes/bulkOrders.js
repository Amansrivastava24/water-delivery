const express = require('express');
const router = express.Router();
const {
    getBulkOrders,
    getBulkOrder,
    createBulkOrder,
    updateBulkOrder,
    deleteBulkOrder,
    recordPayment
} = require('../controllers/bulkOrderController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getBulkOrders)
    .post(createBulkOrder);

router.route('/:id')
    .get(getBulkOrder)
    .put(updateBulkOrder)
    .delete(deleteBulkOrder);

router.post('/:id/payment', recordPayment);

module.exports = router;
