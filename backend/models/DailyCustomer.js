const mongoose = require('mongoose');

/**
 * Daily Customer Schema
 * Manages regular customers with delivery and payment tracking
 */
const dailyCustomerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    bottleType: {
        type: String,
        required: [true, 'Bottle type is required'],
        enum: ['20L', '10L', '5L', '2L', '1L'],
        default: '20L'
    },
    pricePerBottle: {
        type: Number,
        required: [true, 'Price per bottle is required'],
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    businessId: {
        type: String,
        required: true,
        default: 'default-business'
    },
    // Payment tracking fields
    totalBilled: {
        type: Number,
        default: 0,
        min: 0
    },
    totalPaid: {
        type: Number,
        default: 0,
        min: 0
    },
    pendingBalance: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
dailyCustomerSchema.index({ businessId: 1, isActive: 1 });
dailyCustomerSchema.index({ name: 1 });

// Virtual for calculating pending balance
dailyCustomerSchema.pre('save', function (next) {
    this.pendingBalance = this.totalBilled - this.totalPaid;
    next();
});

module.exports = mongoose.model('DailyCustomer', dailyCustomerSchema);
