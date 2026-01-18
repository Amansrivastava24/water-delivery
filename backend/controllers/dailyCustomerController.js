const { body, validationResult } = require('express-validator');
const DailyCustomer = require('../models/DailyCustomer');

/**
 * @route   GET /api/daily-customers
 * @desc    Get all daily customers
 * @access  Private
 */
exports.getCustomers = async (req, res, next) => {
    try {
        const { isActive, search } = req.query;
        const businessId = req.user.businessId;

        // Build query
        let query = { businessId };

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }

        const customers = await DailyCustomer.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/daily-customers/:id
 * @desc    Get single customer
 * @access  Private
 */
exports.getCustomer = async (req, res, next) => {
    try {
        const customer = await DailyCustomer.findOne({
            _id: req.params.id,
            businessId: req.user.businessId
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/daily-customers
 * @desc    Create new customer
 * @access  Private
 */
exports.createCustomer = [
    // Validation
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('address').notEmpty().trim().withMessage('Address is required'),
    body('phone').notEmpty().trim().withMessage('Phone is required'),
    body('bottleType').isIn(['20L', '10L', '5L', '2L', '1L']).withMessage('Invalid bottle type'),
    body('pricePerBottle').isFloat({ min: 0 }).withMessage('Price must be a positive number'),

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

            const customerData = {
                ...req.body,
                businessId: req.user.businessId
            };

            const customer = await DailyCustomer.create(customerData);

            res.status(201).json({
                success: true,
                message: 'Customer created successfully',
                data: customer
            });
        } catch (error) {
            next(error);
        }
    }
];

/**
 * @route   PUT /api/daily-customers/:id
 * @desc    Update customer
 * @access  Private
 */
exports.updateCustomer = async (req, res, next) => {
    try {
        let customer = await DailyCustomer.findOne({
            _id: req.params.id,
            businessId: req.user.businessId
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Update fields
        const allowedUpdates = ['name', 'address', 'phone', 'bottleType', 'pricePerBottle', 'isActive'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                customer[field] = req.body[field];
            }
        });

        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Customer updated successfully',
            data: customer
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/daily-customers/:id
 * @desc    Delete customer
 * @access  Private
 */
exports.deleteCustomer = async (req, res, next) => {
    try {
        const customer = await DailyCustomer.findOne({
            _id: req.params.id,
            businessId: req.user.businessId
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        await customer.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Customer deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/daily-customers/:id/balance
 * @desc    Get customer payment balance
 * @access  Private
 */
exports.getCustomerBalance = async (req, res, next) => {
    try {
        const customer = await DailyCustomer.findOne({
            _id: req.params.id,
            businessId: req.user.businessId
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                customerId: customer._id,
                customerName: customer.name,
                totalBilled: customer.totalBilled,
                totalPaid: customer.totalPaid,
                pendingBalance: customer.pendingBalance
            }
        });
    } catch (error) {
        next(error);
    }
};
