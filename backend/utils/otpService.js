const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const OTP = require('../models/OTP');

/**
 * EXAMPLE: OTP Service with Real Email Sending
 * This file shows how to integrate NodeMailer for production use
 */

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create email transporter
 * Configure with your email service credentials
 */
const createTransporter = () => {
    // Option 1: Gmail
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,     // your-email@gmail.com
            pass: process.env.EMAIL_PASSWORD  // app-specific password
        }
    });

    // Option 2: SendGrid
    // return nodemailer.createTransport({
    //     host: 'smtp.sendgrid.net',
    //     port: 587,
    //     auth: {
    //         user: 'apikey',
    //         pass: process.env.SENDGRID_API_KEY
    //     }
    // });

    // Option 3: Custom SMTP
    // return nodemailer.createTransport({
    //     host: process.env.SMTP_HOST,
    //     port: process.env.SMTP_PORT,
    //     secure: false,
    //     auth: {
    //         user: process.env.SMTP_USER,
    //         pass: process.env.SMTP_PASSWORD
    //     }
    // });
};

/**
 * Send OTP to email
 */
const sendOTP = async (email) => {
    try {
        // Generate OTP
        const otpCode = generateOTP();

        // Hash OTP before storing
        const hashedOTP = await bcrypt.hash(otpCode, 10);

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email });

        // Store OTP in database
        const otpExpire = parseInt(process.env.OTP_EXPIRE) || 10; // minutes
        await OTP.create({
            email,
            otp: hashedOTP,
            expiresAt: new Date(Date.now() + otpExpire * 60 * 1000)
        });

        // Send email based on environment
        if (process.env.NODE_ENV === 'production') {
            // PRODUCTION: Send real email
            const transporter = createTransporter();

            const mailOptions = {
                from: `"Water Delivery System" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your Login OTP - Water Delivery System',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #6c5ce7;">Water Delivery System</h2>
                        <p>Hello,</p>
                        <p>Your One-Time Password (OTP) for login is:</p>
                        <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #6c5ce7;">
                            ${otpCode}
                        </div>
                        <p style="color: #666;">This OTP is valid for ${otpExpire} minutes.</p>
                        <p style="color: #666;">If you didn't request this OTP, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);

            console.log(`✅ OTP email sent to ${email}`);

            return {
                success: true,
                message: 'OTP sent to your email'
            };

        } else {
            // DEVELOPMENT: Log to console
            console.log('\n📧 ========== OTP EMAIL (DEV MODE) ==========');
            console.log(`To: ${email}`);
            console.log(`OTP Code: ${otpCode}`);
            console.log(`Valid for: ${otpExpire} minutes`);
            console.log('==========================================\n');

            return {
                success: true,
                message: 'OTP sent successfully',
                // In development, optionally return OTP for testing
                otp: otpCode
            };
        }

    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
    }
};

/**
 * Verify OTP
 */
const verifyOTP = async (email, otpCode) => {
    try {
        // Find OTP record
        const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return {
                success: false,
                message: 'OTP not found or expired'
            };
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return {
                success: false,
                message: 'OTP has expired'
            };
        }

        // Verify OTP
        const isValid = await bcrypt.compare(otpCode, otpRecord.otp);

        if (!isValid) {
            return {
                success: false,
                message: 'Invalid OTP'
            };
        }

        // Delete OTP after successful verification
        await OTP.deleteOne({ _id: otpRecord._id });

        return {
            success: true,
            message: 'OTP verified successfully'
        };

    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw new Error('Failed to verify OTP');
    }
};

module.exports = {
    generateOTP,
    sendOTP,
    verifyOTP
};
