import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import UnifiedLogin from './pages/UnifiedLogin'
import Register from './pages/Register'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderTracking from './pages/OrderTracking'
import AvailableOrders from './pages/AvailableOrders'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<UnifiedLogin />} />
          <Route path="/customer/login" element={<Navigate to="/login" replace />} />
          <Route path="/partner/login" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          
          {/* Customer Routes */}
          <Route path="/customer/products" element={<Products />} />
          <Route path="/customer/cart" element={<Cart />} />
          <Route path="/customer/orders" element={<Orders />} />
          <Route path="/customer/orders/:orderId" element={<OrderTracking />} />
          
          {/* Partner Routes */}
          <Route path="/partner/orders" element={<AvailableOrders />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App