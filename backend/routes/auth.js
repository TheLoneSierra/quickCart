const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  })
}

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['customer', 'partner', 'admin']),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password, role, firstName, lastName, phone, address } = req.body

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
      role,
      profile: {
        firstName,
        lastName,
        phone: phone || '',
        address: address || {}
      }
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password, userType } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    console.log('🔍 User lookup result:', user ? 'User found' : 'User not found')
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Verify password
    console.log('🔐 Comparing password...')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('🔐 Password comparison result:', isPasswordValid)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check user type if specified
    if (userType && user.role !== userType) {
      return res.status(403).json({ 
        message: `Access denied. This account is for ${user.role}s only.`,
        userRole: user.role,
        requestedRole: userType
      })
    }

    // Generate token
    const token = generateToken(user._id)

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed' })
  }
})

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(401).json({ message: 'Invalid token' })
  }
})

// Update profile
router.put('/profile', [
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { firstName, lastName, phone, address } = req.body

    // Update profile fields
    if (firstName) user.profile.firstName = firstName
    if (lastName) user.profile.lastName = lastName
    if (phone) user.profile.phone = phone
    if (address) user.profile.address = address

    await user.save()

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ message: 'Profile update failed' })
  }
})

module.exports = router

