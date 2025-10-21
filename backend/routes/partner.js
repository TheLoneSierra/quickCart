const express = require('express')
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
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

// Get available orders (not assigned to any partner)
router.get('/orders/available', async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: { $in: ['placed', 'preparing'] },
      deliveryPartner: { $exists: false }
    })
      .populate('customer', 'profile.firstName profile.lastName profile.phone')
      .populate('items.product')
      .sort({ createdAt: -1 })

    res.json({ orders })
  } catch (error) {
    console.error('Get available orders error:', error)
    res.status(500).json({ message: 'Failed to fetch available orders' })
  }
})

// Accept order (lock mechanism)
router.post('/orders/:orderId/accept', authenticateToken, async (req, res) => {
  try {
    const partnerId = req.userId
    const { orderId } = req.params
    
    // Get partner details
    const partner = await User.findById(partnerId)
    if (!partner || partner.role !== 'partner') {
      return res.status(403).json({ message: 'Access denied. Partner account required.' })
    }

    const order = await Order.findOne({ orderId })
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Check if order is already locked/assigned
    if (order.isLocked && order.lockedBy && order.lockedBy.toString() !== partnerId) {
      return res.status(409).json({ 
        message: 'Order is currently being processed by another partner',
        lockedBy: order.lockedBy
      })
    }

    if (order.assignedPartner) {
      return res.status(400).json({ message: 'Order already assigned to a partner' })
    }

    if (!['placed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be accepted in current status' })
    }

    // Lock the order and assign to partner
    order.isLocked = true
    order.lockedBy = partnerId
    order.assignedPartner = partnerId
    order.partnerEmail = partner.email
    order.status = 'accepted'
    order.timestamps.accepted = new Date()
    
    await order.save()

    // Notify customer and admin about order acceptance
    const io = req.app.get('io')
    if (io) {
      // Notify customer
      io.to(`customer_${order.customerId}`).emit('order_accepted', {
        orderId: order.orderId,
        partnerName: `${partner.profile.firstName} ${partner.profile.lastName}`,
        partnerPhone: partner.profile.phone,
        estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      })

      // Notify admin
      io.to('admin').emit('order_assigned', {
        orderId: order.orderId,
        customerName: order.customerEmail,
        partnerName: `${partner.profile.firstName} ${partner.profile.lastName}`,
        timestamp: order.timestamps.accepted
      })

      // Remove from available orders for other partners
      io.to('partners').emit('order_removed', { orderId: order.orderId })

      console.log(`✅ Partner ${partner.email} accepted order ${order.orderId}`)
    }

    res.json({
      message: 'Order accepted successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        customerEmail: order.customerEmail,
        items: order.items,
        deliveryAddress: order.deliveryAddress,
        timestamps: order.timestamps
      }
    })
  } catch (error) {
    console.error('Accept order error:', error)
    res.status(500).json({ message: 'Failed to accept order' })
  }
})

// Update order status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['preparing', 'out_for_delivery', 'delivered']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const order = await Order.findOne({
      _id: req.params.id,
      deliveryPartner: 'demo-partner-id'
    })

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to you' })
    }

    order.status = status
    
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date()
    }

    await order.save()

    res.json({
      message: 'Order status updated successfully',
      order
    })
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ message: 'Failed to update order status' })
  }
})

// Get partner's assigned orders
router.get('/orders/assigned', async (req, res) => {
  try {
    const orders = await Order.find({ deliveryPartner: 'demo-partner-id' })
      .populate('customer', 'profile.firstName profile.lastName profile.phone')
      .populate('items.product')
      .sort({ createdAt: -1 })

    res.json({ orders })
  } catch (error) {
    console.error('Get assigned orders error:', error)
    res.status(500).json({ message: 'Failed to fetch assigned orders' })
  }
})

// Get partner statistics
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ deliveryPartner: 'demo-partner-id' })
    const completedOrders = await Order.countDocuments({ 
      deliveryPartner: 'demo-partner-id', 
      status: 'delivered' 
    })
    const activeOrders = await Order.countDocuments({ 
      deliveryPartner: 'demo-partner-id', 
      status: { $in: ['preparing', 'out_for_delivery'] }
    })

    res.json({
      totalOrders,
      completedOrders,
      activeOrders,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(1) : 0
    })
  } catch (error) {
    console.error('Get partner stats error:', error)
    res.status(500).json({ message: 'Failed to fetch statistics' })
  }
})

module.exports = router

