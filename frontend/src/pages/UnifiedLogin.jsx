import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const UnifiedLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userType, setUserType] = useState('customer')
  
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(email, password, userType)
    
    if (result.success) {
      // Show success toast
      toast.success(`Welcome back!`, {
        icon: '👋',
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
        },
      })
      
      // Navigate based on user type
      if (userType === 'customer') {
        navigate('/customer/products')
      } else if (userType === 'partner') {
        navigate('/partner/orders')
      } else if (userType === 'admin') {
        navigate('/admin/dashboard')
      }
    } else {
      // Handle role-based access errors with specific toasts
      if (result.userRole && result.requestedRole) {
        toast.error(`Access Denied! This account is for ${result.userRole}s only.`, {
          icon: '🚫',
          duration: 5000,
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        })
        setError(`This account is for ${result.userRole}s only. Please select the correct account type.`)
      } else {
        toast.error(result.error || 'Login failed', {
          icon: '❌',
          duration: 4000,
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        })
        setError(result.error)
      }
    }
    
    setLoading(false)
  }

  const getUserTypeColor = (type) => {
    switch (type) {
      case 'customer': return 'from-blue-50 to-indigo-100'
      case 'partner': return 'from-green-50 to-emerald-100'
      case 'admin': return 'from-purple-50 to-pink-100'
      default: return 'from-blue-50 to-indigo-100'
    }
  }

  const getUserTypeIcon = (type) => {
    switch (type) {
      case 'customer': return '🛍️'
      case 'partner': return '🚚'
      case 'admin': return '⚙️'
      default: return '👤'
    }
  }

  const getUserTypeTitle = (type) => {
    switch (type) {
      case 'customer': return 'Customer Login'
      case 'partner': return 'Partner Login'
      case 'admin': return 'Admin Login'
      default: return 'Login'
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="max-w-md w-full">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl font-bold">🛒</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">QuickCart</h1>
            <p className="text-gray-600 text-lg">Fast Delivery, Fresh Products</p>
            <div className="mt-2">
              <span className="text-sm text-gray-500">{getUserTypeTitle(userType)}</span>
            </div>
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Select Account Type</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setUserType('customer')}
                  className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                    userType === 'customer' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-lg mb-1">🛍️</div>
                  Customer
                </button>
                <button
                  onClick={() => setUserType('partner')}
                  className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                    userType === 'partner' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-lg mb-1">🚚</div>
                  Partner
                </button>
                <button
                  onClick={() => setUserType('admin')}
                  className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                    userType === 'admin' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-lg mb-1">⚙️</div>
                  Admin
                </button>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">✉</div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔒</div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button type="button" className="text-blue-500 text-sm hover:underline font-medium">
                  Forgot Password?
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${userType === 'customer' ? 'bg-blue-500 hover:bg-blue-600' : userType === 'partner' ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600'} text-white py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 shadow-lg`}
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/register')}
                className="text-blue-500 hover:underline font-medium"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-20 left-16 w-40 h-40 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-32 right-10 w-28 h-28 bg-white rounded-full opacity-10"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-12">
          {/* Shopping Illustration */}
          <div className="mb-8">
            <div className="w-48 h-48 mx-auto mb-6 relative">
              {/* Shopping Cart */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-32 h-20 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-4xl">🛒</span>
              </div>
              
              {/* Delivery Truck */}
              <div className="absolute bottom-8 right-8 w-16 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
              
              {/* Fresh Products */}
              <div className="absolute top-4 left-4 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xl">🍎</span>
              </div>
              
              <div className="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xl">🥬</span>
              </div>
              
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xl">🥛</span>
              </div>
              
              {/* Connection Lines */}
              <div className="absolute top-16 left-8 w-16 h-0.5 bg-white bg-opacity-30 transform rotate-12"></div>
              <div className="absolute top-16 right-8 w-16 h-0.5 bg-white bg-opacity-30 transform -rotate-12"></div>
              <div className="absolute bottom-16 left-8 w-16 h-0.5 bg-white bg-opacity-30 transform -rotate-12"></div>
            </div>
          </div>

          {/* Text Content */}
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-4">Welcome to QuickCart</h2>
            <p className="text-lg opacity-90 mb-6">
              Experience lightning-fast delivery of fresh groceries and everyday essentials right to your doorstep.
            </p>
            
            {/* Features */}
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-sm">⚡</span>
                </div>
                <span className="text-sm opacity-90">30-minute delivery guarantee</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-sm">🌱</span>
                </div>
                <span className="text-sm opacity-90">Fresh, organic products</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-sm">📱</span>
                </div>
                <span className="text-sm opacity-90">Real-time order tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnifiedLogin
