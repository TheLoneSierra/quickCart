const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  total: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['placed', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
    default: 'placed'
  },
  assignedPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  partnerEmail: {
    type: String,
    default: null
  },
  trackingData: {
    currentLocation: {
      lat: Number,
      lng: Number,
      address: String
    },
    estimatedDelivery: Date,
    deliveryNotes: String
  },
  timestamps: {
    placed: { type: Date, default: Date.now },
    accepted: Date,
    pickedUp: Date,
    inTransit: Date,
    delivered: Date
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
})

// Index for faster queries
orderSchema.index({ orderId: 1 })
orderSchema.index({ customerId: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ assignedPartner: 1 })

module.exports = mongoose.model('Order', orderSchema)