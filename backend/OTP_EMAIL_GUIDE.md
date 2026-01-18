# OTP Email Integration Guide

## Current Status

**The OTP is NOT sent to email right now.** Instead, it's printed to the backend console for development/testing purposes.

When you request an OTP, you'll see this in your **backend terminal**:

```
📧 ========== OTP EMAIL ==========
To: admin@waterdelivery.com
OTP Code: 123456
Valid for: 10 minutes
==================================
```

---

## Why Console Instead of Email?

This is **intentional for development** because:
1. ✅ No email service setup required
2. ✅ Faster testing (no waiting for emails)
3. ✅ No email service costs during development
4. ✅ Works offline
5. ✅ No risk of spam filters blocking test emails

---

## How to Enable Real Email Sending

### Option 1: Gmail (Easiest for Testing)

#### Step 1: Install NodeMailer
```bash
cd backend
npm install nodemailer
```

#### Step 2: Get Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords
4. Generate a new app password for "Mail"
5. Copy the 16-character password

#### Step 3: Update `.env` file

Add these variables to `backend/.env`:
```env
# Email Configuration
NODE_ENV=production
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

#### Step 4: Replace `otpService.js`

Copy the code from `otpService-email-example.js` to `otpService.js`

#### Step 5: Restart Backend
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

**Done!** OTPs will now be sent to real email addresses.

---

### Option 2: SendGrid (Best for Production)

#### Step 1: Sign up for SendGrid
- Go to https://sendgrid.com/
- Free tier: 100 emails/day

#### Step 2: Get API Key
- Dashboard → Settings → API Keys
- Create API Key with "Mail Send" permissions
- Copy the API key

#### Step 3: Install Dependencies
```bash
npm install nodemailer
npm install @sendgrid/mail
```

#### Step 4: Update `.env`
```env
NODE_ENV=production
EMAIL_USER=noreply@yourdomain.com
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

#### Step 5: Update `otpService.js`

Use the SendGrid configuration from `otpService-email-example.js` (lines 29-36)

---

### Option 3: Custom SMTP Server

If you have your own email server:

#### Update `.env`
```env
NODE_ENV=production
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASSWORD=your-password
EMAIL_USER=noreply@yourdomain.com
```

#### Update `otpService.js`

Use the Custom SMTP configuration from `otpService-email-example.js` (lines 38-47)

---

## Testing Email Integration

### Test 1: Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your-real-email@gmail.com"}'
```

**Expected**: You should receive an email with the OTP

### Test 2: Check Email
- Open your email inbox
- Look for email from "Water Delivery System"
- Copy the 6-digit OTP

### Test 3: Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-real-email@gmail.com",
    "otp": "123456",
    "name": "Test User",
    "phone": "9876543210"
  }'
```

---

## Email Template

The production email looks like this:

```
Subject: Your Login OTP - Water Delivery System

Water Delivery System
━━━━━━━━━━━━━━━━━━━━━━

Hello,

Your One-Time Password (OTP) for login is:

┌─────────────────┐
│    1 2 3 4 5 6  │
└─────────────────┘

This OTP is valid for 10 minutes.

If you didn't request this OTP, please ignore this email.

━━━━━━━━━━━━━━━━━━━━━━
This is an automated email. Please do not reply.
```

---

## Troubleshooting

### Issue 1: "Invalid credentials" error with Gmail

**Solution**: 
- Make sure you're using an **App Password**, not your regular Gmail password
- Enable 2-Step Verification first
- Generate a new App Password specifically for this app

### Issue 2: Emails going to spam

**Solution**:
- Use a verified domain email (not Gmail for production)
- Add SPF and DKIM records to your domain
- Use a professional email service like SendGrid

### Issue 3: "Connection timeout" error

**Solution**:
- Check firewall settings
- Verify SMTP port (usually 587 or 465)
- Try using port 587 with `secure: false`

### Issue 4: Want to keep console logging in production

**Solution**: Modify the `sendOTP` function to log AND send email:
```javascript
// Log to console (for debugging)
console.log(`✅ OTP sent to ${email}: ${otpCode}`);

// Also send email
await transporter.sendMail(mailOptions);
```

---

## Security Best Practices

1. ✅ **Never commit `.env` file** - Already in `.gitignore`
2. ✅ **Use app-specific passwords** - Not your main email password
3. ✅ **Rotate API keys regularly** - Change SendGrid keys periodically
4. ✅ **Rate limit OTP requests** - Prevent spam (already implemented)
5. ✅ **Hash OTPs in database** - Already done with bcrypt
6. ✅ **Set expiration time** - OTPs expire after 10 minutes

---

## Cost Comparison

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| **Gmail** | 500 emails/day | Not recommended for production |
| **SendGrid** | 100 emails/day | $15/month for 40k emails |
| **Mailgun** | 5,000 emails/month | $35/month for 50k emails |
| **AWS SES** | 62,000 emails/month (if hosted on AWS) | $0.10 per 1,000 emails |

---

## Recommendation

- **Development**: Keep console logging (current setup) ✅
- **Testing**: Use Gmail with App Password
- **Production**: Use SendGrid or AWS SES

---

## Quick Switch Between Console and Email

You can keep both and switch based on environment:

```javascript
// In otpService.js
if (process.env.NODE_ENV === 'production') {
    // Send real email
    await transporter.sendMail(mailOptions);
} else {
    // Log to console
    console.log(`OTP: ${otpCode}`);
}
```

Then just change `NODE_ENV` in `.env`:
- `NODE_ENV=development` → Console logging
- `NODE_ENV=production` → Real emails

---

## Summary

✅ **Current**: OTP printed to console (perfect for development)  
📧 **To enable emails**: Install NodeMailer + configure Gmail/SendGrid  
🚀 **Best for production**: SendGrid or AWS SES  
💰 **Cost**: Free tier available for all major services  

The current console-based system is **perfect for development and testing**. Only switch to real emails when you're ready to deploy to production!
