const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendOTP, verifyOTP } = require('../utils/otpService');

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to email
 * @access  Public
 */
exports.sendOTPController = [
    // Validation
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),

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

            const { email } = req.body;

            // Send OTP
            const result = await sendOTP(email);

            res.status(200).json({
                success: true,
                message: 'OTP sent to your email',
                ...(process.env.NODE_ENV === 'development' && { otp: result.otp })
            });

        } catch (error) {
            next(error);
        }
    }
];

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and login user
 * @access  Public
 */
exports.verifyOTPController = [
    // Validation
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),

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

            const { email, otp, name, phone } = req.body;

            // Verify OTP
            const otpResult = await verifyOTP(email, otp);

            if (!otpResult.success) {
                return res.status(400).json({
                    success: false,
                    message: otpResult.message
                });
            }

            // Find or create user
            let user = await User.findOne({ email });

            if (!user) {
                // Create new user
                user = await User.create({
                    email,
                    name: name || email.split('@')[0],
                    phone: phone || '',
                    role: 'admin', // First user is admin
                    businessId: 'default-business'
                });
            }

            // Generate token
            const token = generateToken(user._id);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    businessId: user.businessId
                }
            });

        } catch (error) {
            next(error);
        }
    }
];

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = req.user;

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
                businessId: user.businessId
            }
        });
    } catch (error) {
        next(error);
    }
};
