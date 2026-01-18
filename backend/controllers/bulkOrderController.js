const { body, validationResult } = require('express-validator');
const BulkOrder = require('../models/BulkOrder');

/**
 * @route   GET /api/bulk-orders
 * @desc    Get all bulk orders
 * @access  Private
 */
exports.getBulkOrders = async (req, res, next) => {
    try {
        const { paymentStatus, startDate, endDate } = req.query;
        const businessId = req.user.businessId;

        // Build query
        let query = { businessId };

        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        const orders = await BulkOrder.find(query)
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/bulk-orders/:id
 * @desc    Get single bulk order
 * @access  Private
 */
exports.getBulkOrder = async (req, res, next) => {
    try {
        const order = await BulkOrder.findOne({
            _id: req.params.id,
            businessId: req.user.businessId
        }).populate('createdBy', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/bulk-orders
 * @desc    Create new bulk order
 * @access  Private
 */
exports.createBulkOrder = [
    // Validation
    body('customerName').notEmpty().trim().withMessage('Customer name is required'),
    body('phone').notEmpty().trim().withMessage('Phone is required'),
    body('address').notEmpty().trim().withMessage('Address is required'),
    body('eventType').isIn(['wedding', 'festival', 'corporate', 'party', 'other']).withMessage('Invalid event type'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('pricePerBottle').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('deliveryDates').isArray({ min: 1 }).withMessage('At least one delivery date is required'),

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

            const orderData = {
                ...req.body,
                businessId: req.user.businessId,
                createdBy: req.user._id
            };

            const order = await BulkOrder.create(orderData);

            res.status(201).json({
                success: true,
                message: 'Bulk order created successfully',
                data: order
            });
        } catch (error) {
            next(error);
        }
    }
];

/**
 * @route   PUT /api/bulk-orders/:id
 * @desc    Update bulk order
 * @access  Private
 */
exports.updateBulkOrder = async (req, res, next) => {
    try {
        let order = await BulkOrder.findOne({
            _id: req.params.id,
            businessId: req.user.businessId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update allowed fields
        const allowedUpdates = [
            'customerName', 'phone', 'address', 'eventType',
            'deliveryDates', 'quantity', 'bottleType', 'pricePerBottle', 'notes'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                order[field] = req.body[field];
            }
        });

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/bulk-orders/:id
 * @desc    Delete bulk order
 * @access  Private
 */
exports.deleteBulkOrder = async (req, res, next) => {
    try {
        const order = await BulkOrder.findOne({
            _id: req.params.id,
            businessId: req.user.businessId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await order.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/bulk-orders/:id/payment
 * @desc    Record payment for bulk order
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

            let order = await BulkOrder.findOne({
                _id: req.params.id,
                businessId: req.user.businessId
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            // Update payment
            order.paidAmount = paidAmount;
            await order.save();

            res.status(200).json({
                success: true,
                message: 'Payment recorded successfully',
                data: order
            });
        } catch (error) {
            next(error);
        }
    }
];
