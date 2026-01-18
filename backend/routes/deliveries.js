const express = require('express');
const router = express.Router();
const {
    getDeliveries,
    getTodayDeliveries,
    createDelivery,
    updateDelivery,
    recordPayment,
    getTodayCustomersWithDeliveryStatus,
    markDelivery,
    getMonthlyDeliveries
} = require('../controllers/deliveryController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getDeliveries)
    .post(createDelivery);

router.get('/today', getTodayDeliveries);
router.get('/today/customers', getTodayCustomersWithDeliveryStatus);
router.post('/mark', markDelivery);
router.get('/monthly', getMonthlyDeliveries);

router.put('/:id', updateDelivery);
router.post('/:id/payment', recordPayment);

module.exports = router;
