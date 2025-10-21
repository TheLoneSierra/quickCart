const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Bakery', 'Beverages']
  },
  image: String,
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['lb', 'kg', 'piece', 'dozen', 'bunch', 'jar', 'bottle']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Product', productSchema)

