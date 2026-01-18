const mongoose = require('mongoose');

/**
 * Bulk Order Schema
 * Manages large orders for events like weddings and festivals
 */
const bulkOrderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    eventType: {
        type: String,
        required: [true, 'Event type is required'],
        enum: ['wedding', 'festival', 'corporate', 'party', 'other'],
        default: 'other'
    },
    deliveryDates: [{
        type: Date,
        required: true
    }],
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: 1
    },
    bottleType: {
        type: String,
        required: true,
        enum: ['20L', '10L', '5L', '2L', '1L'],
        default: '20L'
    },
    pricePerBottle: {
        type: Number,
        required: [true, 'Price per bottle is required'],
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'partial', 'pending'],
        default: 'pending'
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    pendingAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    businessId: {
        type: String,
        required: true,
        default: 'default-business'
    },
    notes: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Calculate total and pending amounts before saving
bulkOrderSchema.pre('save', function (next) {
    this.totalAmount = this.quantity * this.pricePerBottle;
    this.pendingAmount = this.totalAmount - this.paidAmount;

    // Update payment status based on amounts
    if (this.paidAmount === 0) {
        this.paymentStatus = 'pending';
    } else if (this.paidAmount >= this.totalAmount) {
        this.paymentStatus = 'paid';
    } else {
        this.paymentStatus = 'partial';
    }

    next();
});

// Indexes
bulkOrderSchema.index({ businessId: 1, createdAt: -1 });
bulkOrderSchema.index({ paymentStatus: 1 });
bulkOrderSchema.index({ deliveryDates: 1 });

module.exports = mongoose.model('BulkOrder', bulkOrderSchema);
