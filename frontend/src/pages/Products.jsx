import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { cart, addToCart } = useCart()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully!', {
      icon: '👋',
      duration: 2000,
    })
    navigate('/login')
  }

  const handleAddToCart = (product) => {
    addToCart(product)
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      duration: 3000,
      style: {
        background: '#10B981',
        color: '#fff',
      },
    })
  }

  
  const featuredProducts = [
    {
      id: 1,
      name: 'Fresh Apples',
      price: '$2.99/lb',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop',
      category: 'Fruits'
    },
    {
      id: 2,
      name: 'Ripe Bananas',
      price: '$0.59/lb',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
      category: 'Fruits'
    }
  ]

  const allProducts = [
    {
      id: 3,
      name: 'Organic Spinach',
      price: '$3.99/bunch',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop',
      category: 'Vegetables'
    },
    {
      id: 4,
      name: 'Free-Range Eggs',
      price: '$4.49/dozen',
      image: 'https://images.unsplash.com/photo-1518569656558-1e25d22c5f8e?w=300&h=200&fit=crop',
      category: 'Dairy'
    },
    {
      id: 5,
      name: 'Artisan Cheese',
      price: '$6.99/lb',
      image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop',
      category: 'Dairy'
    },
    {
      id: 6,
      name: 'Local Honey',
      price: '$5.49/jar',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=200&fit=crop',
      category: 'Dairy'
    }
  ]


  const filteredProducts = allProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <div className="text-gray-600 text-xl">←</div>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Fresh Products</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigate('/customer/cart')}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <div className="text-gray-600 text-xl">🛒</div>
              {cart.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </div>
              )}
            </button>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</div>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          />
        </div>
      </div>


      {/* Featured Products */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Featured Products</h2>
        <div className="grid grid-cols-2 gap-4">
          {featuredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={() => handleAddToCart(product)}
                  className="absolute top-3 right-3 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
                >
                  <div className="text-white text-xl">+</div>
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-blue-600 font-bold text-lg">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Products */}
      <div className="px-4 pb-20">
        <h2 className="text-lg font-bold text-gray-800 mb-4">All Products</h2>
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={() => handleAddToCart(product)}
                  className="absolute top-3 right-3 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
                >
                  <div className="text-white text-xl">+</div>
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-blue-600 font-bold text-lg">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-blue-500 text-white p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Cart: {cart.length} items</p>
            <button className="bg-white text-blue-500 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              View Cart
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-3">
          <button className="flex flex-col items-center py-2 text-blue-500">
            <div className="text-xl mb-1">🛍️</div>
            <span className="text-xs font-medium">Products</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-700">
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

export default Products