# 🚀 Quick Commerce Delivery App

A real-time delivery application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO for live order tracking and updates.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Demo Credentials](#demo-credentials)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

A full-stack quick commerce delivery platform that enables customers to order products, delivery partners to accept and fulfill orders, and admins to monitor the entire operation in real-time. The application features real-time updates using WebSocket connections for live order tracking.

## ✨ Features

### Customer Features
- 🛒 Browse products by category (Fruits, Vegetables, Dairy, Meat, Bakery, Beverages)
- 🛍️ Add items to cart and place orders
- 📦 Real-time order tracking with status updates
- 📱 View order history
- 🔔 Live notifications for order status changes

### Delivery Partner Features
- 📋 View available orders in real-time
- ✅ Accept and manage delivery assignments
- 🚚 Update order status (Picked Up, In Transit, Delivered)
- 📊 Track delivery performance

### Admin Features
- 📈 Comprehensive dashboard with live statistics
- 👥 Manage delivery partners
- 📦 Monitor all orders in real-time
- 📊 View system-wide metrics and analytics
- 🔍 Search and filter orders

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication
- **bcrypt.js** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time updates
- **React Hot Toast** - Toast notifications
- **JWT Decode** - Token decoding

## 📁 Project Structure

```
delivery-app/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema (Customer, Partner, Admin)
│   │   ├── Order.js          # Order schema
│   │   └── Product.js        # Product schema
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── customer.js       # Customer-specific routes
│   │   ├── partner.js        # Partner-specific routes
│   │   └── admin.js          # Admin-specific routes
│   ├── socket/
│   │   └── socketHandler.js  # Socket.IO event handlers
│   ├── server.js             # Main server file
│   ├── package.json
│   └── .env                  # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── pages/
│   │   │   ├── UnifiedLogin.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── OrderTracking.jsx
│   │   │   ├── AvailableOrders.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB Atlas Account** (or local MongoDB instance)
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd delivery-app
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Secret
JWT_SECRET=your_secure_jwt_secret_key

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

### Frontend Configuration

Update the API endpoint in `frontend/src` if needed. By default, it connects to `http://localhost:5000`.

## 🏃 Running the Application

### Method 1: Run Backend and Frontend Separately

#### Start Backend Server

```bash
cd backend
npm start
```

The backend server will start on `http://localhost:5000`

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port shown in terminal)

### Method 2: Using the Start Script (if available)

```bash
./start.sh
```

## 🔐 Demo Credentials

After running the database seeding script (`node backend/quickSeed.js`), use these credentials:

### Customer Account
- **Email:** customer@demo.com
- **Password:** password123

### Delivery Partner Account
- **Email:** partner@demo.com
- **Password:** password123

### Admin Account
- **Email:** admin@demo.com
- **Password:** password123

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Customer Routes
- `GET /api/customer/orders` - Get customer's orders
- `GET /api/customer/orders/:orderId` - Get specific order
- `POST /api/customer/orders` - Create new order

### Partner Routes
- `GET /api/partner/orders/available` - Get available orders
- `POST /api/partner/orders/:orderId/accept` - Accept an order

### Admin Routes
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/partners` - Get all delivery partners

### Health Check
- `GET /health` - Server health status

## 👥 User Roles

### Customer
- Browse and search products
- Add items to cart
- Place orders
- Track order status in real-time
- View order history

### Delivery Partner
- View available orders
- Accept delivery assignments
- Update order status
- Manage active deliveries

### Admin
- Full system oversight
- Monitor all orders and partners
- View analytics and statistics
- Manage users and products

## 🔧 Database Seeding

To populate the database with demo users and sample data:

```bash
cd backend
node quickSeed.js
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🐳 Docker Support

Docker configuration files are included for containerized deployment:

```bash
docker-compose up
```

## 📱 Features in Detail

### Real-Time Updates
- Order status changes are instantly reflected across all connected clients
- Partners see new orders as they're placed
- Customers see live delivery status updates
- Admin dashboard shows real-time statistics

### Security Features
- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- Protected routes with authentication middleware
- Rate limiting on sensitive endpoints
- Helmet security headers
- Input validation and sanitization

### Order Lifecycle
1. **Placed** - Customer creates order
2. **Accepted** - Partner accepts the order
3. **Picked Up** - Partner picks up items
4. **In Transit** - Order is on the way
5. **Delivered** - Order successfully delivered

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Aanchal**

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Socket.IO for real-time communication
- React and Vite communities
- Tailwind CSS for styling utilities

## 📞 Support

For support, email aanchalpal2009@example.com or open an issue in the repository.

---

**Happy Coding! 🚀**
