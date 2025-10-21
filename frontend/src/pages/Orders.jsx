import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { API_URL } from '../config'
import toast from 'react-hot-toast'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
  }, [token])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/customer/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        console.log('Customer orders loaded:', data.orders?.length || 0)
      } else {
        toast.error('Failed to load orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Network error loading orders')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully!', {
      icon: '👋',
      duration: 2000,
    })
    navigate('/login')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed': return 'bg-blue-100 text-blue-600'
      case 'preparing': return 'bg-yellow-100 text-yellow-600'
      case 'out_for_delivery': return 'bg-purple-100 text-purple-600'
      case 'delivered': return 'bg-green-100 text-green-600'
      case 'cancelled': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'placed': return '📝'
      case 'preparing': return '👨‍🍳'
      case 'out_for_delivery': return '🚚'
      case 'delivered': return '✅'
      case 'cancelled': return '❌'
      default: return '📦'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <div className="text-gray-600 text-xl">←</div>
          </button>
          <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
          <button 
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Loading orders...</h2>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
          <button 
            onClick={() => navigate('/customer/products')}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="px-4 py-6 space-y-4">
          {orders.map(order => (
            <div key={order.orderId} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">Order #{order.orderId}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.timestamps?.placed || order.createdAt).toLocaleDateString()} at {new Date(order.timestamps?.placed || order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  <span className="mr-1">{getStatusIcon(order.status)}</span>
                  {order.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Items ({order.items.length}):</p>
                <div className="space-y-1">
                  {order.items.slice(0, 2).map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>${(parseFloat(item.price.replace('$', '').split('/')[0]) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-gray-500">+{order.items.length - 2} more items</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-bold text-lg text-blue-600">${order.total}</p>
                </div>
                <button
                  onClick={() => navigate(`/customer/orders/${order.id}`)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Track Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-3">
          <button 
            onClick={() => navigate('/customer/products')}
            className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-700"
          >
            <div className="text-xl mb-1">🛍️</div>
            <span className="text-xs">Products</span>
          </button>
          <button className="flex flex-col items-center py-2 text-blue-500">
            <div className="text-xl mb-1">📋</div>
            <span className="text-xs font-medium">Orders</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-700">
            <div className="text-xl mb-1">👤</div>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Orders

