import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'customer'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const result = await register(formData)
    
    console.log('Registration result:', result)
    console.log('Form data userType:', formData.userType)
    
    if (result.success) {
      console.log('Registration successful, navigating based on userType:', formData.userType)
      // Navigate based on userType
      if (formData.userType === 'customer') {
        navigate('/customer/products')
      } else if (formData.userType === 'partner') {
        navigate('/partner/orders')
      } else {
        navigate('/admin/dashboard')
      }
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">R</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join our delivery platform</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Account Type</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, userType: 'customer'})}
                  className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                    formData.userType === 'customer' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-lg mb-1">🛍️</div>
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, userType: 'partner'})}
                  className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                    formData.userType === 'partner' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-lg mb-1">🚚</div>
                  Partner
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, userType: 'admin'})}
                  className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                    formData.userType === 'admin' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-lg mb-1">⚙️</div>
                  Admin
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">✉</div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                  required
                />
              </div>
            </div>

            {/* Password Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔒</div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔒</div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
              >
                <option value="customer">Customer</option>
                <option value="partner">Delivery Partner</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-500 text-white py-4 rounded-xl font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <p className="text-sm text-purple-800 font-medium mb-2">Demo Registration</p>
            <p className="text-xs text-purple-600">This creates a demo account for testing purposes</p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/customer/login')}
              className="text-purple-500 hover:underline font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register

