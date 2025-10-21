import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import toast from 'react-hot-toast'

const AvailableOrders = () => {
  const { logout, token } = useAuth()
  const { socket, emitEvent } = useSocket()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch available orders
    fetchAvailableOrders()

    // Join partners room for new order notifications
    if (socket) {
      socket.emit('join_partners_room')
      
      // Listen for new orders
      socket.on('new_order', (orderData) => {
        toast.success(`New order available! ${orderData.customerName} - $${orderData.total}`, {
          icon: '🆕',
          duration: 5000,
          style: {
            background: '#3B82F6',
            color: '#fff',
          },
        })
        fetchAvailableOrders() // Refresh orders
      })

      // Listen for order removal (when another partner accepts)
      socket.on('order_removed', (data) => {
        setOrders(prev => prev.filter(order => order.orderId !== data.orderId))
        toast.info('Order was accepted by another partner', {
          icon: 'ℹ️',
          duration: 3000,
        })
      })
    }

    return () => {
      if (socket) {
        socket.off('new_order')
        socket.off('order_removed')
      }
    }
  }, [socket])

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/partner/orders/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        
        const availableCount = data.orders?.filter(order => order.status === 'placed').length || 0
        if (availableCount > 0) {
          toast.success(`${availableCount} orders available for pickup!`, {
            icon: '📋',
            duration: 3000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
          })
        }
      } else {
        toast.error('Failed to fetch orders', {
          icon: '❌',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Network error', {
        icon: '🌐',
        duration: 3000,
      })
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

  const acceptOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/partner/orders/${orderId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (response.ok) {
        // Remove order from available list
        setOrders(prev => prev.filter(order => order.orderId !== orderId))
        
        // Show success toast
        toast.success(`Order accepted! Heading to ${result.order.customerEmail}'s location`, {
          duration: 5000,
          icon: '🚚',
          style: {
            background: '#10B981',
            color: '#fff',
          },
        })
      } else {
        if (response.status === 409) {
          // Order was locked by another partner
          toast.error('Order is being processed by another partner', {
            icon: '🔒',
            duration: 4000,
            style: {
              background: '#EF4444',
              color: '#fff',
            },
          })
          // Refresh orders to remove locked ones
          fetchAvailableOrders()
        } else {
          toast.error(result.message || 'Failed to accept order', {
            icon: '❌',
            duration: 4000,
            style: {
              background: '#EF4444',
              color: '#fff',
            },
          })
        }
      }
    } catch (error) {
      console.error('Error accepting order:', error)
      toast.error('Network error. Please try again.', {
        icon: '🌐',
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <div className="text-gray-600 text-xl">←</div>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Available Orders</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 py-6 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Available</h3>
            <p className="text-gray-500">Check back later for new delivery requests</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.orderId} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    Order #{order.orderId}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Customer: {order.customerEmail}
                  </p>
                  <p className="text-sm text-gray-500">
                    Total: ${order.total?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                    {order.status || 'Available'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {order.timestamps?.placed ? new Date(order.timestamps.placed).toLocaleTimeString() : 'Just now'}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Items:</h4>
                <div className="space-y-1">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-gray-800 font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No items listed</p>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-1">Delivery Address:</h4>
                <p className="text-sm text-gray-600">
                  {order.deliveryAddress?.street || 'Address not provided'}
                </p>
                <p className="text-sm text-gray-500">
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipCode}
                </p>
                <p className="text-sm text-gray-500">
                  Phone: {order.deliveryAddress?.phone || 'Not provided'}
                </p>
              </div>

              {/* Accept Button */}
              <button
                onClick={() => acceptOrder(order.orderId)}
                className="w-full py-4 rounded-xl font-semibold transition-all bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg"
              >
                <div className="flex items-center justify-center space-x-2">
                  <div className="text-xl">🚚</div>
                  <span>Accept Order</span>
                </div>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-3">
          <button className="flex flex-col items-center py-2 text-green-500">
            <div className="text-xl mb-1">📋</div>
            <span className="text-xs font-medium">Orders</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-700">
            <div className="text-xl mb-1">👤</div>
            <span className="text-xs">Account</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AvailableOrders