const express = require('express')
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const Product = require('../models/Product')
const Order = require('../models/Order')
const User = require('../models/User')

const router = express.Router()

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' })
    }
    req.userId = decoded.userId
    next()
  })
}

// Get all products
router.get('/products', async (req, res) => {
  try {
    const { category, search, featured } = req.query
    let query = { isAvailable: true }

    if (category && category !== 'All') {
      query.category = category
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }

    if (featured === 'true') {
      query.isFeatured = true
    }

    const products = await Product.find(query).sort({ isFeatured: -1, createdAt: -1 })
    res.json({ products })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ message: 'Failed to fetch products' })
  }
})

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json({ product })
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ message: 'Failed to fetch product' })
  }
})

// Create order
router.post('/orders', authenticateToken, [
  body('items').isArray({ min: 1 }),
  body('items.*.productId').notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.name').notEmpty(),
  body('items.*.price').isNumeric(),
  body('deliveryAddress').isObject(),
  body('deliveryAddress.phone').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array())
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    const { items, deliveryAddress, notes } = req.body
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
    
    // Get customer details
    const customer = await User.findById(customerId)
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    let totalAmount = 0
    const orderItems = []

    // Validate products and calculate total
    for (const item of items) {
      // For now, we'll use mock product data since we don't have a Product model
      const mockProduct = {
        _id: item.productId,
        name: item.name || 'Product',
        price: item.price || 10,
        image: item.image || ''
      }

      const itemTotal = mockProduct.price * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        productId: mockProduct._id,
        name: mockProduct.name,
        price: mockProduct.price,
        quantity: item.quantity,
        image: mockProduct.image
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

    // Notify all delivery partners about the new order
    try {
      const partners = await User.find({ role: 'partner' })
      console.log(`🔍 Found ${partners.length} active partners`)
      
      // Emit to all partners via WebSocket
      const io = req.app.get('io')
      if (io) {
        io.to('partners').emit('new_order', {
          orderId: order.orderId,
          customerName: `${customer.profile.firstName} ${customer.profile.lastName}`,
          total: order.total,
          items: order.items,
          deliveryAddress: order.deliveryAddress,
          timestamp: order.timestamps.placed
        })
        
        console.log(`📢 Notified ${partners.length} partners about new order ${order.orderId}`)
      } else {
        console.log('⚠️ WebSocket io instance not available')
      }
    } catch (notificationError) {
      console.error('❌ Error sending notifications:', notificationError.message)
      // Don't fail the order creation if notifications fail
    }

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
    res.status(500).json({ message: 'Failed to create order' })
  }
})

// Get customer orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({ customer: 'demo-customer-id' })
      .populate('items.product')
      .populate('deliveryPartner', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 })

    res.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ message: 'Failed to fetch orders' })
  }
})

// Get single order
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      customer: 'demo-customer-id'
    })
      .populate('items.product')
      .populate('deliveryPartner', 'profile.firstName profile.lastName')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json({ order })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ message: 'Failed to fetch order' })
  }
})

module.exports = router

