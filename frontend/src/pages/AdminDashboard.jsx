import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'
import { API_URL } from '../config'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { socket, connected } = useSocket()
  const { logout, token } = useAuth()
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState('dashboard')
  const [orders, setOrders] = useState([])
  const [partners, setPartners] = useState([])
  const [dashboardStats, setDashboardStats] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Fetch data from API
  useEffect(() => {
    if (activeView === 'dashboard') {
      fetchDashboardStats()
    } else if (activeView === 'orders') {
      fetchAllOrders()
    } else if (activeView === 'partners') {
      fetchAllPartners()
    }
  }, [activeView, token])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDashboardStats(data)
        console.log('Dashboard stats loaded:', data)
      } else {
        toast.error('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      toast.error('Network error loading dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        console.log('Orders loaded:', data.orders?.length || 0)
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

  const fetchAllPartners = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/admin/partners`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPartners(data.partners || [])
        console.log('Partners loaded:', data.partners?.length || 0)
      } else {
        toast.error('Failed to load partners')
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
      toast.error('Network error loading partners')
    } finally {
      setLoading(false)
    }
  }

  const stats = dashboardStats ? {
    activeOrders: dashboardStats.stats.activeOrders,
    availablePartners: dashboardStats.stats.totalPartners,
    totalOrders: dashboardStats.stats.totalOrders,
    completedOrders: dashboardStats.stats.completedOrders,
    totalCustomers: dashboardStats.stats.totalCustomers,
    systemHealth: connected ? 'online' : 'offline'
  } : {
    activeOrders: 0,
    availablePartners: 0,
    totalOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    systemHealth: 'offline'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed': return 'bg-yellow-100 text-yellow-800'
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-orange-100 text-orange-800'
      case 'offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderDashboard = () => (
    <>
      {/* Stats Cards */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Total Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Total Orders</h3>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="text-blue-500 text-sm">📋</div>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
            <p className="text-xs text-blue-500 mt-1">All time</p>
          </div>

          {/* Active Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Active Orders</h3>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="text-orange-500 text-sm">🚚</div>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.activeOrders}</p>
            <p className="text-xs text-orange-500 mt-1">In progress</p>
          </div>

          {/* Delivery Partners */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Delivery Partners</h3>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="text-green-500 text-sm">👥</div>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.availablePartners}</p>
            <p className="text-xs text-green-500 mt-1">Registered</p>
          </div>

          {/* Total Customers */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Total Customers</h3>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="text-purple-500 text-sm">👤</div>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.totalCustomers}</p>
            <p className="text-xs text-purple-500 mt-1">Registered</p>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">System Health</h3>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="text-green-500 text-sm">⚙️</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`font-semibold ${connected ? 'text-green-500' : 'text-red-500'}`}>
              {connected ? 'All Systems Online' : 'Connection Issues'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">WebSocket: {connected ? 'Connected' : 'Disconnected'}</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => setActiveView('orders')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
            >
              View All Orders ({orders.length})
            </button>
            <button 
              onClick={() => setActiveView('partners')}
              className="w-full bg-white text-blue-600 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            >
              View All Partners ({partners.length})
            </button>
            <button 
              onClick={() => setActiveView('live')}
              className="w-full bg-white text-purple-600 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            >
              View Live Status ({dashboardStats?.recentOrders?.length || 0})
            </button>
          </div>
        </div>
      </div>
    </>
  )

  const renderOrders = () => (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">All Orders</h2>
        <button 
          onClick={() => setActiveView('dashboard')}
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Orders Yet</h3>
          <p className="text-gray-500">Orders will appear here when customers place them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div key={order.orderId || index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">Order #{order.orderId}</h3>
                  <p className="text-sm text-gray-600">Customer: {order.customerEmail}</p>
                  <p className="text-sm text-gray-500">{new Date(order.timestamps?.placed || order.createdAt).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Items</p>
                  <p className="font-semibold">{order.items?.length || 0} items</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold">${order.total?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              
              {order.partnerEmail && (
                <div className="text-sm text-gray-600 mb-2">
                  <p><strong>Assigned Partner:</strong> {order.partnerEmail}</p>
                </div>
              )}
              
              {order.deliveryAddress && (
                <div className="text-sm text-gray-600">
                  <p><strong>Address:</strong> {order.deliveryAddress.street}, {order.deliveryAddress.city}</p>
                  <p><strong>Phone:</strong> {order.deliveryAddress.phone}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderPartners = () => (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Delivery Partners</h2>
        <button 
          onClick={() => setActiveView('dashboard')}
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="space-y-4">
        {partners.map((partner) => (
          <div key={partner.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-500 font-bold text-lg">
                    {partner.email.split('@')[0].substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{partner.email}</h3>
                  <p className="text-sm text-gray-600">Delivery Partner</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ACTIVE
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="font-semibold text-lg">{partner.totalOrders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="font-semibold text-lg">{partner.activeOrders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="font-semibold text-lg">{partner.completedOrders}</p>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Joined: {new Date(partner.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderLiveStatus = () => (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Live Status</h2>
        <button 
          onClick={() => setActiveView('dashboard')}
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="space-y-4">
        {dashboardStats?.recentOrders?.map((order, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-800">Order #{order.orderId}</h3>
                <p className="text-sm text-gray-600">Customer: {order.customerEmail}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Delivery Partner</p>
                <p className="font-semibold">{order.partnerEmail || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold">${order.total?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Placed: {new Date(order.placedAt).toLocaleString()}</p>
            </div>
            
            {/* Live tracking indicator */}
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">Live tracking active</span>
            </div>
          </div>
        )) || (
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Recent Orders</h3>
            <p className="text-gray-500">Recent orders will appear here</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <div className="text-gray-600 text-xl">☰</div>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'dashboard' && renderDashboard()}
      {activeView === 'orders' && renderOrders()}
      {activeView === 'partners' && renderPartners()}
      {activeView === 'live' && renderLiveStatus()}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-3">
          <button 
            onClick={() => setActiveView('orders')}
            className={`flex flex-col items-center py-2 ${activeView === 'orders' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="text-xl mb-1">📋</div>
            <span className="text-xs">Orders</span>
          </button>
          <button 
            onClick={() => setActiveView('partners')}
            className={`flex flex-col items-center py-2 ${activeView === 'partners' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="text-xl mb-1">👥</div>
            <span className="text-xs">Partners</span>
          </button>
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center py-2 ${activeView === 'dashboard' ? 'text-purple-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="text-xl mb-1">⚙️</div>
            <span className="text-xs font-medium">Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard