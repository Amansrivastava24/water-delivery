const mongoose = require('mongoose');

/**
 * Daily Delivery Schema
 * Tracks daily deliveries and payments for regular customers
 */
const dailyDeliverySchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DailyCustomer',
        required: true
    },
    deliveryDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    delivered: {
        type: Boolean,
        default: true
    },
    quantityDelivered: {
        type: Number,
        required: function () {
            return this.delivered;
        },
        min: 0,
        default: 1
    },
    amountBilled: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    deliveredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    businessId: {
        type: String,
        required: true,
        default: 'default-business'
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Unique compound index to prevent duplicate deliveries per customer per day
dailyDeliverySchema.index({ customerId: 1, deliveryDate: 1 }, { unique: true });

// Compound indexes for efficient queries
dailyDeliverySchema.index({ businessId: 1, deliveryDate: -1 });
dailyDeliverySchema.index({ customerId: 1, deliveryDate: -1 });
dailyDeliverySchema.index({ deliveryDate: -1 });

module.exports = mongoose.model('DailyDelivery', dailyDeliverySchema);
