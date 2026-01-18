const express = require('express');
const router = express.Router();
const {
    getKPIs,
    getRevenueTrend,
    getMonthlyComparison
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/kpis', getKPIs);
router.get('/revenue-trend', getRevenueTrend);
router.get('/monthly-comparison', getMonthlyComparison);

module.exports = router;
