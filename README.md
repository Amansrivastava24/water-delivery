# Water Delivery Management System

A production-ready full-stack web application for managing daily water bottle deliveries and bulk event orders.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)

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
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + OTP (email-based)
- **Validation**: express-validator
- **Security**: helmet, cors, bcryptjs

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS (modern design system)
- **State Management**: Context API

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

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

#### 1. Clone the repository
```bash
cd c:\Users\Welcome\Desktop\teste
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
copy .env.example .env

# Edit .env file with your configuration
# Update MONGODB_URI if using MongoDB Atlas
# Update JWT_SECRET for production

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

#### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/water-delivery
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
OTP_EXPIRE=10
```

## 👤 Test Credentials

After running the seed script, you can login with:

**Email**: `admin@waterdelivery.com` or `worker@waterdelivery.com`

**OTP**: Check the backend console - the OTP will be displayed there (in development mode)

## 📊 API Documentation

### Authentication Endpoints

#### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify OTP & Login
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "name": "John Doe",
  "phone": "9876543210"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Daily Customers

```http
GET    /api/daily-customers          # List all customers
POST   /api/daily-customers          # Create customer
GET    /api/daily-customers/:id      # Get single customer
PUT    /api/daily-customers/:id      # Update customer
DELETE /api/daily-customers/:id      # Delete customer
GET    /api/daily-customers/:id/balance  # Get payment balance
```

### Deliveries

```http
GET    /api/deliveries               # List deliveries
POST   /api/deliveries               # Record delivery
GET    /api/deliveries/today         # Today's deliveries
PUT    /api/deliveries/:id           # Update delivery
POST   /api/deliveries/:id/payment   # Record payment
```

### Bulk Orders

```http
GET    /api/bulk-orders              # List bulk orders
POST   /api/bulk-orders              # Create bulk order
GET    /api/bulk-orders/:id          # Get single order
PUT    /api/bulk-orders/:id          # Update order
DELETE /api/bulk-orders/:id          # Delete order
POST   /api/bulk-orders/:id/payment  # Record payment
```

### Dashboard

```http
GET /api/dashboard/kpis                  # Get KPIs
GET /api/dashboard/revenue-trend         # Revenue trend (30 days)
GET /api/dashboard/monthly-comparison    # Monthly comparison
```

### Reports

```http
GET /api/reports/customer-payments   # Customer payment report
GET /api/reports/bulk-orders         # Bulk order report
GET /api/reports/delivery-summary    # Delivery summary
GET /api/reports/export              # Export to CSV
```

## 🎨 UI Features

- **Modern Design System** - Custom CSS with gradients, animations, and smooth transitions
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Dark Accents** - Professional color scheme with vibrant highlights
- **Smooth Animations** - Hover effects, page transitions, loading states
- **Worker-Friendly** - Clean, intuitive interface for daily operations

## 🔒 Security Features

- JWT-based authentication
- Password-less OTP login
- Protected API routes
- Input validation on all forms
- CORS enabled
- Helmet security headers
- MongoDB injection prevention

## 📱 Screenshots

### Login Page
- Gradient background with floating bubbles
- Two-step OTP authentication
- Development mode OTP display

### Dashboard
- KPI cards with icons and gradients
- Income overview (monthly, 3-month, 6-month, yearly)
- Quick statistics

### Customers Page
- Full CRUD operations
- Search and filter functionality
- Payment balance tracking
- Active/inactive status

### Bulk Orders
- Event type categorization
- Payment status indicators
- Quick payment recording

### Reports
- Tabbed interface
- Date range filtering
- Summary statistics
- CSV export

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run dev

# In another terminal, test endpoints using curl or Postman
# Sample test:
curl http://localhost:5000/health
```

### Frontend Testing
```bash
cd frontend
npm run dev

# Open browser to http://localhost:5173
# Login with test credentials
# Test all CRUD operations
```

## 📦 Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🤝 Contributing

This is a demonstration project. Feel free to fork and modify for your needs.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💡 Future Enhancements

- Real email service integration (NodeMailer, SendGrid)
- SMS notifications for deliveries
- Mobile app (React Native)
- Payment gateway integration
- Route optimization for deliveries
- Customer mobile app for order tracking
- WhatsApp integration
- Automated billing and invoicing

## 🐛 Known Issues

- OTP is currently mocked (console log) - integrate real email service for production
- No automated tests yet - add Jest/Mocha tests
- No Docker configuration - add for easier deployment

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for water delivery businesses**
