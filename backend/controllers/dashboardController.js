const DailyDelivery = require('../models/DailyDelivery');
const DailyCustomer = require('../models/DailyCustomer');
const BulkOrder = require('../models/BulkOrder');

/**
 * @route   GET /api/dashboard/kpis
 * @desc    Get key performance indicators
 * @access  Private
 */
exports.getKPIs = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const now = new Date();

        // Today's range
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        // This month's range
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // 3 months range
        const threeMonthsStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);

        // 6 months range
        const sixMonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        // Year range
        const yearStart = new Date(now.getFullYear(), 0, 1);

        // Today's delivery total
        const todayDeliveries = await DailyDelivery.aggregate([
            {
                $match: {
                    businessId,
                    deliveryDate: { $gte: todayStart, $lt: todayEnd }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amountBilled' },
                    quantity: { $sum: '$quantityDelivered' }
                }
            }
        ]);

        // Monthly income (daily deliveries + bulk orders)
        const monthlyDeliveries = await DailyDelivery.aggregate([
            {
                $match: {
                    businessId,
                    deliveryDate: { $gte: monthStart, $lt: monthEnd }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amountBilled' }
                }
            }
        ]);

        const monthlyBulkOrders = await BulkOrder.aggregate([
            {
                $match: {
                    businessId,
                    createdAt: { $gte: monthStart, $lt: monthEnd }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        // 3-month income
        const threeMonthDeliveries = await DailyDelivery.aggregate([
            {
                $match: {
                    businessId,
                    deliveryDate: { $gte: threeMonthsStart }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amountBilled' }
                }
            }
        ]);

        const threeMonthBulkOrders = await BulkOrder.aggregate([
            {
                $match: {
                    businessId,
                    createdAt: { $gte: threeMonthsStart }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        // 6-month income
        const sixMonthDeliveries = await DailyDelivery.aggregate([
            {
                $match: {
                    businessId,
                    deliveryDate: { $gte: sixMonthsStart }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amountBilled' }
                }
            }
        ]);

        const sixMonthBulkOrders = await BulkOrder.aggregate([
            {
                $match: {
                    businessId,
                    createdAt: { $gte: sixMonthsStart }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Yearly income
        const yearlyDeliveries = await DailyDelivery.aggregate([
            {
                $match: {
                    businessId,
                    deliveryDate: { $gte: yearStart }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amountBilled' }
                }
            }
        ]);

        const yearlyBulkOrders = await BulkOrder.aggregate([
            {
                $match: {
                    businessId,
                    createdAt: { $gte: yearStart }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Pending payments (from daily customers)
        const customers = await DailyCustomer.find({ businessId });
        const totalPending = customers.reduce((sum, customer) => sum + customer.pendingBalance, 0);

        // Pending bulk order payments
        const pendingBulkOrders = await BulkOrder.aggregate([
            {
                $match: {
                    businessId,
                    paymentStatus: { $in: ['pending', 'partial'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$pendingAmount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                todayTotal: todayDeliveries[0]?.total || 0,
                todayQuantity: todayDeliveries[0]?.quantity || 0,
                monthlyIncome: (monthlyDeliveries[0]?.total || 0) + (monthlyBulkOrders[0]?.total || 0),
                threeMonthIncome: (threeMonthDeliveries[0]?.total || 0) + (threeMonthBulkOrders[0]?.total || 0),
                sixMonthIncome: (sixMonthDeliveries[0]?.total || 0) + (sixMonthBulkOrders[0]?.total || 0),
                yearlyIncome: (yearlyDeliveries[0]?.total || 0) + (yearlyBulkOrders[0]?.total || 0),
                pendingPayments: totalPending + (pendingBulkOrders[0]?.total || 0),
                activeCustomers: customers.filter(c => c.isActive).length,
                totalCustomers: customers.length
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/dashboard/revenue-trend
 * @desc    Get daily revenue trend for the last 30 days
 * @access  Private
 */
exports.getRevenueTrend = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const days = parseInt(req.query.days) || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Get daily deliveries grouped by date
        const deliveryTrend = await DailyDelivery.aggregate([
            {
                $match: {
                    businessId,
                    deliveryDate: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$deliveryDate' }
                    },
                    amount: { $sum: '$amountBilled' },
                    quantity: { $sum: '$quantityDelivered' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: deliveryTrend.map(item => ({
                date: item._id,
                amount: item.amount,
                quantity: item.quantity
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/dashboard/monthly-comparison
 * @desc    Get monthly comparison for the last 6 months
 * @access  Private
 */
exports.getMonthlyComparison = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        // Get monthly deliveries
        const monthlyData = await DailyDelivery.aggregate([
            {
                $match: {
                    businessId,
                    deliveryDate: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$deliveryDate' },
                        month: { $month: '$deliveryDate' }
                    },
                    amount: { $sum: '$amountBilled' },
                    quantity: { $sum: '$quantityDelivered' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Get monthly bulk orders
        const monthlyBulk = await BulkOrder.aggregate([
            {
                $match: {
                    businessId,
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    amount: { $sum: '$totalAmount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Merge data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const result = monthlyData.map(item => {
            const bulk = monthlyBulk.find(b =>
                b._id.year === item._id.year && b._id.month === item._id.month
            );

            return {
                month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
                deliveries: item.amount,
                bulkOrders: bulk?.amount || 0,
                total: item.amount + (bulk?.amount || 0)
            };
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};
