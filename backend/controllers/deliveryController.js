const { body, validationResult } = require('express-validator');
const DailyDelivery = require('../models/DailyDelivery');
const DailyCustomer = require('../models/DailyCustomer');

/**
 * @route   GET /api/deliveries
 * @desc    Get all deliveries
 * @access  Private
 */
exports.getDeliveries = async (req, res, next) => {
    try {
        const { startDate, endDate, customerId } = req.query;
        const businessId = req.user.businessId;

        // Build query
        let query = { businessId };

        if (customerId) {
            query.customerId = customerId;
        }

        if (startDate || endDate) {
            query.deliveryDate = {};
            if (startDate) {
                query.deliveryDate.$gte = new Date(startDate);
            }
            if (endDate) {
                query.deliveryDate.$lte = new Date(endDate);
            }
        }

        const deliveries = await DailyDelivery.find(query)
            .populate('customerId', 'name phone bottleType')
            .populate('deliveredBy', 'name')
            .sort({ deliveryDate: -1 });

        res.status(200).json({
            success: true,
            count: deliveries.length,
            data: deliveries
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/deliveries/today
 * @desc    Get today's deliveries
 * @access  Private
 */
exports.getTodayDeliveries = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const deliveries = await DailyDelivery.find({
            businessId,
            deliveryDate: {
                $gte: today,
                $lt: tomorrow
            }
        })
            .populate('customerId', 'name phone bottleType address')
            .populate('deliveredBy', 'name')
            .sort({ createdAt: -1 });

        // Calculate today's total
        const totalAmount = deliveries.reduce((sum, delivery) => sum + delivery.amountBilled, 0);
        const totalQuantity = deliveries.reduce((sum, delivery) => sum + delivery.quantityDelivered, 0);

        res.status(200).json({
            success: true,
            count: deliveries.length,
            totalAmount,
            totalQuantity,
            data: deliveries
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/deliveries
 * @desc    Record a delivery
 * @access  Private
 */
exports.createDelivery = [
    // Validation
    body('customerId').notEmpty().withMessage('Customer ID is required'),
    body('quantityDelivered').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

    async (req, res, next) => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: errors.array()[0].msg
                });
            }

            const { customerId, quantityDelivered, deliveryDate, notes, isPaid, paidAmount } = req.body;

            // Get customer details
            const customer = await DailyCustomer.findOne({
                _id: customerId,
                businessId: req.user.businessId
            });

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }

            // Calculate amount
            const amountBilled = customer.pricePerBottle * quantityDelivered;

            // Create delivery
            const delivery = await DailyDelivery.create({
                customerId,
                deliveryDate: deliveryDate || new Date(),
                quantityDelivered,
                amountBilled,
                isPaid: isPaid || false,
                paidAmount: paidAmount || 0,
                deliveredBy: req.user._id,
                businessId: req.user.businessId,
                notes
            });

            // Update customer totals
            customer.totalBilled += amountBilled;
            if (isPaid && paidAmount) {
                customer.totalPaid += paidAmount;
            }
            await customer.save();

            // Populate and return
            await delivery.populate('customerId', 'name phone bottleType');
            await delivery.populate('deliveredBy', 'name');

            res.status(201).json({
                success: true,
                message: 'Delivery recorded successfully',
                data: delivery
            });
        } catch (error) {
            next(error);
        }
    }
];

/**
 * @route   PUT /api/deliveries/:id
 * @desc    Update delivery
 * @access  Private
 */
exports.updateDelivery = async (req, res, next) => {
    try {
        const delivery = await DailyDelivery.findOne({
            _id: req.params.id,
            businessId: req.user.businessId
        });

        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: 'Delivery not found'
            });
        }

        // Update allowed fields
        const allowedUpdates = ['quantityDelivered', 'deliveryDate', 'notes'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                delivery[field] = req.body[field];
            }
        });

        // Recalculate amount if quantity changed
        if (req.body.quantityDelivered) {
            const customer = await DailyCustomer.findById(delivery.customerId);
            const oldAmount = delivery.amountBilled;
            delivery.amountBilled = customer.pricePerBottle * delivery.quantityDelivered;

            // Update customer total
            customer.totalBilled = customer.totalBilled - oldAmount + delivery.amountBilled;
            await customer.save();
        }

        await delivery.save();

        res.status(200).json({
            success: true,
            message: 'Delivery updated successfully',
            data: delivery
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/deliveries/:id/payment
 * @desc    Record payment for delivery
 * @access  Private
 */
exports.recordPayment = [
    body('paidAmount').isFloat({ min: 0 }).withMessage('Paid amount must be a positive number'),

    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: errors.array()[0].msg
                });
            }

            const { paidAmount } = req.body;

            const delivery = await DailyDelivery.findOne({
                _id: req.params.id,
                businessId: req.user.businessId
            });

            if (!delivery) {
                return res.status(404).json({
                    success: false,
                    message: 'Delivery not found'
                });
            }

            // Update delivery payment
            const previousPaid = delivery.paidAmount;
            delivery.paidAmount = paidAmount;
            delivery.isPaid = paidAmount >= delivery.amountBilled;
            await delivery.save();

            // Update customer totals
            const customer = await DailyCustomer.findById(delivery.customerId);
            customer.totalPaid = customer.totalPaid - previousPaid + paidAmount;
            await customer.save();

            res.status(200).json({
                success: true,
                message: 'Payment recorded successfully',
                data: delivery
            });
        } catch (error) {
            next(error);
        }
    }
];

/**
 * @route   GET /api/deliveries/today/customers
 * @desc    Get all customers with today's delivery status
 * @access  Private
 */
exports.getTodayCustomersWithDeliveryStatus = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get all active customers
        const customers = await DailyCustomer.find({
            businessId,
            isActive: true
        }).sort({ name: 1 });

        // Get today's deliveries
        const todayDeliveries = await DailyDelivery.find({
            businessId,
            deliveryDate: {
                $gte: today,
                $lt: tomorrow
            }
        });

        // Create a map of customerId -> delivery
        const deliveryMap = {};
        todayDeliveries.forEach(delivery => {
            deliveryMap[delivery.customerId.toString()] = delivery;
        });

        // Combine customer data with delivery status
        const customersWithStatus = customers.map(customer => {
            const delivery = deliveryMap[customer._id.toString()];
            return {
                _id: customer._id,
                name: customer.name,
                address: customer.address,
                phone: customer.phone,
                bottleType: customer.bottleType,
                pricePerBottle: customer.pricePerBottle,
                deliveredToday: delivery ? delivery.delivered : false,
                deliveryId: delivery ? delivery._id : null,
                quantityDelivered: delivery ? delivery.quantityDelivered : 0,
                amountBilled: delivery ? delivery.amountBilled : 0
            };
        });

        res.status(200).json({
            success: true,
            count: customersWithStatus.length,
            data: customersWithStatus
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/deliveries/mark
 * @desc    Mark or unmark delivery for a customer (upsert)
 * @access  Private
 */
exports.markDelivery = [
    body('customerId').notEmpty().withMessage('Customer ID is required'),
    body('delivered').isBoolean().withMessage('Delivered must be a boolean'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a positive number'),

    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: errors.array()[0].msg
                });
            }

            const { customerId, delivered, quantity, deliveryDate } = req.body;
            const businessId = req.user.businessId;

            // Get customer
            const customer = await DailyCustomer.findOne({
                _id: customerId,
                businessId
            });

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }

            // Normalize date to start of day
            const targetDate = deliveryDate ? new Date(deliveryDate) : new Date();
            targetDate.setHours(0, 0, 0, 0);

            // Calculate quantity and amount
            const quantityDelivered = delivered ? (quantity || 1) : 0;
            const amountBilled = delivered ? customer.pricePerBottle * quantityDelivered : 0;

            // Find existing delivery for this customer and date
            let delivery = await DailyDelivery.findOne({
                customerId,
                deliveryDate: targetDate,
                businessId
            });

            const isNewDelivery = !delivery;
            const oldAmount = delivery ? delivery.amountBilled : 0;

            if (delivery) {
                // Update existing delivery
                delivery.delivered = delivered;
                delivery.quantityDelivered = quantityDelivered;
                delivery.amountBilled = amountBilled;
                delivery.deliveredBy = req.user._id;
                await delivery.save();
            } else {
                // Create new delivery
                delivery = await DailyDelivery.create({
                    customerId,
                    deliveryDate: targetDate,
                    delivered,
                    quantityDelivered,
                    amountBilled,
                    deliveredBy: req.user._id,
                    businessId
                });
            }

            // Update customer totals
            customer.totalBilled = customer.totalBilled - oldAmount + amountBilled;
            await customer.save();

            res.status(200).json({
                success: true,
                message: delivered ? 'Delivery marked successfully' : 'Delivery unmarked successfully',
                data: {
                    deliveryId: delivery._id,
                    customerId: customer._id,
                    delivered,
                    quantityDelivered,
                    amountBilled,
                    deliveryDate: targetDate
                }
            });
        } catch (error) {
            // Handle duplicate key error
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Delivery already exists for this customer on this date'
                });
            }
            next(error);
        }
    }
];

/**
 * @route   GET /api/deliveries/monthly
 * @desc    Get monthly delivery matrix for all customers
 * @access  Private
 */
exports.getMonthlyDeliveries = async (req, res, next) => {
    try {
        const { month, customerId } = req.query;
        const businessId = req.user.businessId;

        if (!month) {
            return res.status(400).json({
                success: false,
                message: 'Month parameter is required (format: YYYY-MM)'
            });
        }

        // Parse month (format: YYYY-MM)
        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(year, monthNum, 0);
        endDate.setHours(23, 59, 59, 999);

        // Build query
        let customerQuery = { businessId, isActive: true };
        if (customerId) {
            customerQuery._id = customerId;
        }

        // Get customers
        const customers = await DailyCustomer.find(customerQuery).sort({ name: 1 });

        // Get all deliveries for the month
        const deliveries = await DailyDelivery.find({
            businessId,
            deliveryDate: {
                $gte: startDate,
                $lte: endDate
            }
        });

        // Create delivery map: customerId -> { date -> delivery }
        const deliveryMap = {};
        deliveries.forEach(delivery => {
            const custId = delivery.customerId.toString();
            const dateKey = delivery.deliveryDate.toISOString().split('T')[0];

            if (!deliveryMap[custId]) {
                deliveryMap[custId] = {};
            }
            deliveryMap[custId][dateKey] = {
                delivered: delivery.delivered,
                quantity: delivery.quantityDelivered,
                amount: delivery.amountBilled,
                isPaid: delivery.isPaid
            };
        });

        // Build response
        const monthlyData = customers.map(customer => {
            const custId = customer._id.toString();
            const customerDeliveries = deliveryMap[custId] || {};

            // Create array of daily statuses
            const daysInMonth = new Date(year, monthNum, 0).getDate();
            const dailyStatus = [];

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, monthNum - 1, day);
                const dateKey = date.toISOString().split('T')[0];
                const delivery = customerDeliveries[dateKey];

                dailyStatus.push({
                    day,
                    date: dateKey,
                    delivered: delivery ? delivery.delivered : null,
                    quantity: delivery ? delivery.quantity : 0,
                    amount: delivery ? delivery.amount : 0
                });
            }

            return {
                customerId: customer._id,
                customerName: customer.name,
                bottleType: customer.bottleType,
                pricePerBottle: customer.pricePerBottle,
                dailyStatus
            };
        });

        res.status(200).json({
            success: true,
            month,
            count: monthlyData.length,
            data: monthlyData
        });
    } catch (error) {
        next(error);
    }
};
