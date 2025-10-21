const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

console.log('🔄 Starting server...')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Load environment variables
require('dotenv').config()

// Import models
const User = require('./models/User')
const Order = require('./models/Order')

// Simple authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' })
    }
    req.userId = decoded.userId
    next()
  })
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  })
})

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, userType } = req.body
    
    console.log('Registration request received:', { email, userType })

    // Validate required fields
    if (!email || !password || !userType) {
      return res.status(400).json({ message: 'Email, password, and user type are required' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      role: userType
    })

    console.log('Creating user with role:', userType)
    await user.save()
    console.log('User created successfully:', { id: user._id, email: user.email, role: user.role })

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' })

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body
    
    console.log('Login request:', { email, userType })

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (userType && user.role !== userType) {
      return res.status(403).json({ 
        message: `Access denied. This account is for ${user.role}s only.`,
        userRole: user.role,
        requestedRole: userType
      })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' })

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed' })
  }
})

// Partner routes - Get available orders
app.get('/api/partner/orders/available', authenticateToken, async (req, res) => {
  try {
    const availableOrders = await Order.find({ 
      status: 'placed',
      isLocked: false 
    }).sort({ 'timestamps.placed': -1 })

    console.log(`📋 Found ${availableOrders.length} available orders for partners`)

    res.json({ orders: availableOrders })
  } catch (error) {
    console.error('Get available orders error:', error)
    res.status(500).json({ message: 'Failed to fetch available orders' })
  }
})

// Partner routes - Accept order
app.post('/api/partner/orders/:orderId/accept', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params
    const partnerId = req.userId

    console.log(`🔒 Partner ${partnerId} attempting to accept order ${orderId}`)

    // Find the order
    const order = await Order.findOne({ orderId })
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.status !== 'placed') {
      return res.status(400).json({ message: 'Order is no longer available' })
    }

    if (order.isLocked) {
      return res.status(400).json({ message: 'Order is already being processed by another partner' })
    }

    // Get partner details
    const partner = await User.findById(partnerId)
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' })
    }

    // Lock the order and assign to partner
    order.isLocked = true
    order.lockedBy = partnerId
    order.assignedPartner = partnerId
    order.partnerEmail = partner.email
    order.status = 'accepted'
    order.timestamps.accepted = new Date()
    
    await order.save()
    console.log(`✅ Partner ${partner.email} accepted order ${order.orderId}`)

    res.json({
      message: 'Order accepted successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        timestamps: order.timestamps,
        customerEmail: order.customerEmail,
        total: order.total,
        items: order.items,
        deliveryAddress: order.deliveryAddress
      }
    })
  } catch (error) {
    console.error('Accept order error:', error)
    res.status(500).json({ message: 'Failed to accept order' })
  }
})

// Admin routes - Get all orders
app.get('/api/admin/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ 'timestamps.placed': -1 })
    
    console.log(`📋 Admin requested all orders: ${orders.length} found`)
    
    res.json({ orders })
  } catch (error) {
    console.error('Get all orders error:', error)
    res.status(500).json({ message: 'Failed to fetch orders' })
  }
})

// Admin routes - Get all delivery partners
app.get('/api/admin/partners', authenticateToken, async (req, res) => {
  try {
    const partners = await User.find({ role: 'partner' }).sort({ createdAt: -1 })
    
    console.log(`👥 Admin requested all partners: ${partners.length} found`)
    
    // Get order statistics for each partner
    const partnersWithStats = await Promise.all(
      partners.map(async (partner) => {
        const totalOrders = await Order.countDocuments({ assignedPartner: partner._id })
        const activeOrders = await Order.countDocuments({ 
          assignedPartner: partner._id, 
          status: { $in: ['accepted', 'picked_up', 'in_transit'] } 
        })
        const completedOrders = await Order.countDocuments({ 
          assignedPartner: partner._id, 
          status: 'delivered' 
        })
        
        return {
          id: partner._id,
          email: partner.email,
          role: partner.role,
          createdAt: partner.createdAt,
          totalOrders,
          activeOrders,
          completedOrders
        }
      })
    )
    
    res.json({ partners: partnersWithStats })
  } catch (error) {
    console.error('Get all partners error:', error)
    res.status(500).json({ message: 'Failed to fetch partners' })
  }
})

// Admin routes - Get live statuses (dashboard stats)
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
      totalPartners,
      totalCustomers,
      recentOrders,
      activePartners
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'placed' }),
      Order.countDocuments({ status: { $in: ['accepted', 'picked_up', 'in_transit'] } }),
      Order.countDocuments({ status: 'delivered' }),
      User.countDocuments({ role: 'partner' }),
      User.countDocuments({ role: 'customer' }),
      Order.find().sort({ 'timestamps.placed': -1 }).limit(5),
      User.find({ role: 'partner' }).limit(10)
    ])

    console.log(`📊 Admin dashboard requested: ${totalOrders} orders, ${totalPartners} partners`)

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        activeOrders,
        completedOrders,
        totalPartners,
        totalCustomers
      },
      recentOrders: recentOrders.map(order => ({
        orderId: order.orderId,
        customerEmail: order.customerEmail,
        status: order.status,
        total: order.total,
        placedAt: order.timestamps.placed,
        partnerEmail: order.partnerEmail
      })),
      activePartners: activePartners.map(partner => ({
        id: partner._id,
        email: partner.email,
        createdAt: partner.createdAt
      }))
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ message: 'Failed to fetch dashboard data' })
  }
})

// Customer routes - Get customer orders
app.get('/api/customer/orders', authenticateToken, async (req, res) => {
  try {
    const customerId = req.userId
    const orders = await Order.find({ customerId }).sort({ 'timestamps.placed': -1 })
    
    console.log(`📋 Customer ${customerId} requested orders: ${orders.length} found`)
    
    res.json({ orders })
  } catch (error) {
    console.error('Get customer orders error:', error)
    res.status(500).json({ message: 'Failed to fetch orders' })
  }
})

// Customer routes - Get single order
app.get('/api/customer/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params
    const customerId = req.userId
    
    const order = await Order.findOne({ orderId, customerId })
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    console.log(`📋 Customer ${customerId} requested order ${orderId}`)
    
    res.json({ order })
  } catch (error) {
    console.error('Get customer order error:', error)
    res.status(500).json({ message: 'Failed to fetch order' })
  }
})

// Order creation endpoint
app.post('/api/customer/orders', authenticateToken, async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body
    const customerId = req.userId
    
    console.log('Order creation request:', {
      customerId,
      itemsCount: items?.length,
      deliveryAddress,
      items: items?.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    })
    
    // Basic validation
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' })
    }
    
    if (!deliveryAddress || !deliveryAddress.phone) {
      return res.status(400).json({ message: 'Delivery address with phone number is required' })
    }
    
    // Get customer details
    const customer = await User.findById(customerId)
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    // Calculate total
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const itemTotal = item.price * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })
    }

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create order
    const order = new Order({
      orderId,
      customerId,
      customerEmail: customer.email,
      items: orderItems,
      total: totalAmount,
      deliveryAddress,
      status: 'placed',
      timestamps: {
        placed: new Date()
      }
    })

    await order.save()
    console.log(`✅ Order saved to database: ${order.orderId}`)

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        orderId: order.orderId,
        total: order.total,
        status: order.status,
        items: order.items,
        deliveryAddress: order.deliveryAddress,
        timestamps: order.timestamps
      }
    })
  } catch (error) {
    console.error('Create order error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    res.status(500).json({ message: 'Failed to create order' })
  }
})

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('📡 Connecting to MongoDB Atlas...')
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    })
    console.log('✅ Connected to MongoDB Atlas')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

// Start server
const startServer = async () => {
  try {
    await connectDB()
    
    const PORT = 5000
    app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
      console.log(`🗄️ Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`)
})
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()