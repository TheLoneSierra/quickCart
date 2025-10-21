const express = require('express')
const Order = require('../models/Order')
const User = require('../models/User')
const Product = require('../models/Product')

const router = express.Router()

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [
      totalOrders,
      activeOrders,
      completedOrders,
      totalPartners,
      availablePartners,
      totalProducts,
      lowStockProducts
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['placed', 'preparing', 'out_for_delivery'] } }),
      Order.countDocuments({ status: 'delivered' }),
      User.countDocuments({ role: 'partner' }),
      User.countDocuments({ role: 'partner' }),
      Product.countDocuments({ isAvailable: true }),
      Product.countDocuments({ stock: { $lt: 10 }, isAvailable: true })
    ])

    res.json({
      orders: {
        total: totalOrders,
        active: activeOrders,
        completed: completedOrders
      },
      partners: {
        total: totalPartners,
        available: availablePartners
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts
      },
      systemHealth: 'online'
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' })
  }
})

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    let query = {}

    if (status) {
      query.status = status
    }

    const orders = await Order.find(query)
      .populate('customer', 'profile.firstName profile.lastName email')
      .populate('deliveryPartner', 'profile.firstName profile.lastName')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Order.countDocuments(query)

    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get all orders error:', error)
    res.status(500).json({ message: 'Failed to fetch orders' })
  }
})

// Get all partners
router.get('/partners', async (req, res) => {
  try {
    const partners = await User.find({ role: 'partner' })
      .select('-password')
      .sort({ createdAt: -1 })

    res.json({ partners })
  } catch (error) {
    console.error('Get partners error:', error)
    res.status(500).json({ message: 'Failed to fetch partners' })
  }
})

// Get partner details with orders
router.get('/partners/:id', async (req, res) => {
  try {
    const partner = await User.findById(req.params.id).select('-password')
    if (!partner || partner.role !== 'partner') {
      return res.status(404).json({ message: 'Partner not found' })
    }

    const orders = await Order.find({ deliveryPartner: partner._id })
      .populate('customer', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 })

    res.json({ partner, orders })
  } catch (error) {
    console.error('Get partner details error:', error)
    res.status(500).json({ message: 'Failed to fetch partner details' })
  }
})

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.json({ products })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ message: 'Failed to fetch products' })
  }
})

// Create product
router.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()

    res.status(201).json({
      message: 'Product created successfully',
      product
    })
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ message: 'Failed to create product' })
  }
})

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json({
      message: 'Product updated successfully',
      product
    })
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ message: 'Failed to update product' })
  }
})

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ message: 'Failed to delete product' })
  }
})

// Get system health
router.get('/system/health', async (req, res) => {
  try {
    const dbStatus = await User.findOne() ? 'connected' : 'disconnected'
    
    res.json({
      status: 'online',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'System health check failed'
    })
  }
})

module.exports = router

