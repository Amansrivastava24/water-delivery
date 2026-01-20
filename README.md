# Water Delivery Management System
A production-ready full-stack web application for managing daily water bottle deliveries and bulk event orders.

## 🌟 Features

### Authentication
- ✅ **OTP-based Login** - Secure email + OTP authentication (no passwords)
- ✅ **JWT Tokens** - Secure session management
- ✅ **Role-based Access** - Admin and Worker roles

### Daily Customer Management
- ✅ Add, edit, delete daily customers
- ✅ Track customer details (name, address, phone, bottle type, price)
- ✅ Active/inactive status management
- ✅ Real-time payment balance tracking
- ✅ Search and filter customers

### Delivery Tracking
- ✅ Record daily deliveries
- ✅ Track quantity delivered
- ✅ Automatic amount calculation
- ✅ Payment status tracking
- ✅ Today's delivery summary

### Bulk Orders
- ✅ Create bulk orders for events (weddings, festivals, corporate)
- ✅ Multiple delivery dates support
- ✅ Payment tracking (paid/partial/pending)
- ✅ Event type categorization

### Dashboard & Analytics
- ✅ Today's delivery total
- ✅ Monthly, 3-month, 6-month, yearly income
- ✅ Pending payments overview
- ✅ Active customer count
- ✅ Visual KPI cards

### Reports
- ✅ Customer payment reports
- ✅ Bulk order reports
- ✅ Delivery summary reports
- ✅ Date range filtering
- ✅ **Export to CSV**

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + OTP (email-based)

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios

## 📁 Project Structure

```
water-delivery-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── OTP.js
│   │   ├── DailyCustomer.js
│   │   ├── DailyDelivery.js
│   │   └── BulkOrder.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dailyCustomerController.js
│   │   ├── deliveryController.js
│   │   ├── bulkOrderController.js
│   │   ├── dashboardController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dailyCustomers.js
│   │   ├── deliveries.js
│   │   ├── bulkOrders.js
│   │   ├── dashboard.js
│   │   └── reports.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── otpService.js
│   ├── scripts/
│   │   └── seedData.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── KPICard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DailyCustomers.jsx
│   │   │   ├── BulkOrders.jsx
│   │   │   └── Reports.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── customerService.js
│   │   │   ├── deliveryService.js
│   │   │   ├── bulkOrderService.js
│   │   │   ├── dashboardService.js
│   │   │   └── reportService.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```
