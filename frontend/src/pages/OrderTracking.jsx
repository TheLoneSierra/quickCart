import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'
import { API_URL } from '../config'
import toast from 'react-hot-toast'

const OrderTracking = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { socket, connected, deliveryLocation, orderStatus, emitEvent } = useSocket()
  const { token, logout } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState('placed')
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }) // Default to NYC

  useEffect(() => {
    fetchOrder()
  }, [orderId, token])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/customer/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
        setCurrentStatus(data.order.status)
        console.log('Order loaded:', data.order)
        
        // Join order tracking room
        if (socket && connected) {
          emitEvent('join_order_tracking', { orderId })
        }
      } else {
        toast.error('Order not found')
        navigate('/customer/orders')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Network error loading order')
      navigate('/customer/orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Listen for real-time status updates
    if (orderStatus && orderStatus.orderId === orderId) {
      setCurrentStatus(orderStatus.status)
      
      // Update order in localStorage
      const updatedOrder = { ...order, status: orderStatus.status }
      setOrder(updatedOrder)
      
      if (orderStatus.status === 'delivered') {
        const history = JSON.parse(localStorage.getItem('orderHistory') || '[]')
        history.push(updatedOrder)
        localStorage.setItem('orderHistory', JSON.stringify(history))
        localStorage.removeItem('currentOrder')
      } else {
        localStorage.setItem('currentOrder', JSON.stringify(updatedOrder))
      }
    }
  }, [orderStatus, orderId])

  useEffect(() => {
    // Update map center when delivery location changes
    if (deliveryLocation && deliveryLocation.orderId === orderId) {
      setMapCenter({
        lat: deliveryLocation.lat,
        lng: deliveryLocation.lng
      })
    }
  }, [deliveryLocation, orderId])

  const timeline = [
    {
      id: 1,
      status: 'placed',
      title: 'Order Placed',
      description: 'We have received your order.',
      time: order?.timestamps?.placed ? new Date(order.timestamps.placed).toLocaleTimeString() : 'Just now',
      completed: ['placed', 'accepted', 'picked_up', 'in_transit', 'delivered'].includes(currentStatus),
      current: currentStatus === 'placed'
    },
    {
      id: 2,
      status: 'accepted',
      title: 'Order Accepted',
      description: 'A delivery partner has accepted your order.',
      time: order?.timestamps?.accepted ? new Date(order.timestamps.accepted).toLocaleTimeString() : 'Pending',
      completed: ['accepted', 'picked_up', 'in_transit', 'delivered'].includes(currentStatus),
      current: currentStatus === 'accepted'
    },
    {
      id: 3,
      status: 'picked_up',
      title: 'Picked Up',
      description: 'Your order has been picked up.',
      time: order?.timestamps?.pickedUp ? new Date(order.timestamps.pickedUp).toLocaleTimeString() : 'Pending',
      completed: ['picked_up', 'in_transit', 'delivered'].includes(currentStatus),
      current: currentStatus === 'picked_up'
    },
    {
      id: 4,
      status: 'in_transit',
      title: 'In Transit',
      description: 'Your order is on its way.',
      time: order?.timestamps?.inTransit ? new Date(order.timestamps.inTransit).toLocaleTimeString() : 'Pending',
      completed: ['in_transit', 'delivered'].includes(currentStatus),
      current: currentStatus === 'in_transit'
    },
    {
      id: 5,
      status: 'delivered',
      title: 'Delivered',
      description: 'Order delivered successfully!',
      time: order?.timestamps?.delivered ? new Date(order.timestamps.delivered).toLocaleTimeString() : 'Pending',
      completed: currentStatus === 'delivered',
      current: currentStatus === 'delivered'
    }
  ]

  const getStatusIcon = (status, completed, current) => {
    if (completed) {
      return <div className="text-blue-500 text-2xl">✅</div>
    } else if (current) {
      return <div className="text-blue-500 text-2xl animate-pulse">🚚</div>
    } else {
      return <div className="text-gray-300 text-2xl">📦</div>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Loading order details...</h2>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Order not found</h2>
          <p className="text-gray-500 mb-6">This order doesn't exist or has been removed</p>
          <button 
            onClick={() => navigate('/customer/orders')}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <div className="text-gray-600 text-xl">←</div>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Order Tracking</h1>
          <button 
            onClick={() => {
              logout()
              toast.success('Logged out successfully!', {
                icon: '👋',
                duration: 2000,
              })
              navigate('/login')
            }}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 py-6">
        <div className="space-y-6">
          {timeline.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                  step.completed ? 'bg-blue-500' : step.current ? 'bg-blue-500 animate-pulse' : 'bg-gray-200'
                }`}>
                  {getStatusIcon(step.status, step.completed, step.current)}
                </div>
                {index < timeline.length - 1 && (
                  <div className={`w-1 h-8 mt-2 rounded-full ${
                    step.completed ? 'bg-blue-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
                <p className="text-gray-500 text-xs mt-1 font-medium">{step.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Map */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Live Delivery Tracking</h2>
        <div className="bg-white rounded-2xl h-64 shadow-lg border border-gray-100 overflow-hidden relative">
          {/* Map Placeholder */}
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-gray-600 font-medium mb-2">Live Delivery Tracking</p>
              <p className="text-sm text-gray-500">Real-time location updates</p>
            </div>
          </div>
          
          {/* Delivery Partner Indicator */}
          {deliveryLocation && deliveryLocation.orderId === orderId && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="text-lg">🚚</div>
                <div className="text-sm">
                  <div className="font-semibold">Delivery Partner</div>
                  <div className="text-xs opacity-90">{deliveryLocation.status}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Delivery Address Indicator */}
          {order && (
            <div className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="text-lg">🏠</div>
                <div className="text-sm">
                  <div className="font-semibold">Delivery Address</div>
                  <div className="text-xs opacity-90">123 Main St, NYC</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Connection Status */}
        <div className="mt-3 flex items-center justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-600">
            {connected ? 'Live tracking active' : 'Connecting...'}
          </span>
        </div>
        
        {/* Location Info */}
        {deliveryLocation && deliveryLocation.orderId === orderId && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                <div className="font-semibold">Current Location</div>
                <div className="text-xs">Lat: {deliveryLocation.lat.toFixed(4)}, Lng: {deliveryLocation.lng.toFixed(4)}</div>
              </div>
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {deliveryLocation.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details */}
      <div className="px-4 pb-20">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Order Details</h2>
        <div className="bg-white rounded-2xl p-6 space-y-4 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Order ID</span>
            <span className="font-bold text-blue-600">#{order.id}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Items</span>
            <span className="font-bold">{order.items.length} items</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Delivery Address</span>
            <span className="font-bold text-sm">{order.address}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-600 font-medium">Total</span>
            <span className="font-bold text-xl text-green-600">${order.total}</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-3">
          <button className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-700">
            <div className="text-xl mb-1">📦</div>
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

export default OrderTracking