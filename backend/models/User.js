const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['customer', 'partner', 'admin'],
    default: 'customer'
  }
}, {
  timestamps: true
})

// Index for faster queries
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject()
  delete user.password
  return user
}

module.exports = mongoose.model('User', userSchema)