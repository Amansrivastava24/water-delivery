const mongoose = require('mongoose');

/**
 * User Schema
 * Supports multiple users per business with role-based access
 */
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'worker'],
        default: 'worker'
    },
    businessId: {
        type: String,
        required: true,
        default: 'default-business'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
// Note: email already has an index due to unique: true
userSchema.index({ businessId: 1 });

module.exports = mongoose.model('User', userSchema);
