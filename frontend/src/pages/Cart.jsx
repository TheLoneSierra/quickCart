import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { API_URL } from '../config'
import toast from 'react-hot-toast'

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart()
  const { emitEvent } = useSocket()
  const { token } = useAuth()
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleUpdateQuantity = (id, change) => {
    const item = cart.find(item => item.id === id)
    if (item) {
      updateQuantity(id, item.quantity + change)
    }
  }

  const handleRemoveItem = (id) => {
    removeFromCart(id)
  }

  const calculateTotal = () => {
    return getCartTotal()
  }

  const placeOrder = async () => {
    if (!deliveryAddress || !phoneNumber) {
      toast.error('Please fill in delivery address and phone number', {
        icon: '⚠️',
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      })
      return
    }

    if (!token) {
      toast.error('Please login to place an order', {
        icon: '🔒',
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      })
      return
    }

    setLoading(true)
    
    try {
      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          productId: item.id.toString(),
          name: item.name,
          price: parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0, // Extract numeric value from price string
          quantity: item.quantity,
          image: item.image
        })),
        deliveryAddress: {
          street: deliveryAddress,
          city: '',
          state: '',
          zipCode: '',
          phone: phoneNumber
        }
      }

      console.log('📦 Sending order data:', orderData)
      
      // Send order to backend
      const response = await fetch(`${API_URL}/api/customer/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()
      console.log('📋 Order response:', result)
      console.log('📊 Response status:', response.status)

      if (response.ok) {
        // Show success toast
        toast.success(`Order placed successfully! Order ID: ${result.order.orderId}`, {
          icon: '🎉',
          duration: 5000,
          style: {
            background: '#10B981',
            color: '#fff',
          },
        })

        // Clear cart
        clearCart()
        
        // Navigate to order tracking
        navigate(`/customer/orders/${result.order.orderId}`)
        
      } else {
        toast.error(result.message || 'Failed to place order', {
          icon: '❌',
          duration: 4000,
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        })
      }
      
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Network error. Please try again.', {
        icon: '🌐',
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      })
    } finally {
      setLoading(false)
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
          <h1 className="text-xl font-bold text-gray-800">Shopping Cart</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to get started</p>
          <button 
            onClick={() => navigate('/customer/products')}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="px-4 py-6 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-blue-600 font-bold">{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      <div className="text-gray-600">-</div>
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      <div className="text-gray-600">+</div>
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <div className="text-xl">🗑️</div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Information */}
          <div className="px-4 pb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Delivery Information</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your delivery address..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-4 pb-20">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(parseFloat(item.price.replace('$', '').split('/')[0]) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-blue-600">${calculateTotal()}</span>
                </div>
              </div>
              <button
                onClick={placeOrder}
                disabled={loading}
                className="w-full mt-6 bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-3">
          <button 
            onClick={() => navigate('/customer/products')}
            className="flex flex-col items-center py-2 text-blue-500"
          >
            <div className="text-xl mb-1">🛍️</div>
            <span className="text-xs font-medium">Products</span>
          </button>
          <button 
            onClick={() => navigate('/customer/orders')}
            className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-700"
          >
            <div className="text-xl mb-1">📋</div>
            <span className="text-xs">Orders</span>
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

export default Cart
