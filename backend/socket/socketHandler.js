const jwt = require('jsonwebtoken')

const initializeSocket = (io) => {
  // Store active orders and their tracking data
  const activeOrders = new Map()
  const partnerLocations = new Map()

  // Authentication middleware for socket connections (optional for demo)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
        socket.userId = decoded.userId
        socket.userRole = decoded.role
      } else {
        // Allow connection without token for demo purposes
        socket.userId = 'demo-user'
        socket.userRole = 'customer'
      }
      
      next()
    } catch (error) {
      // Allow connection even with invalid token for demo
      socket.userId = 'demo-user'
      socket.userRole = 'customer'
      next()
    }
  })

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected with role ${socket.userRole}`)

    // Join user to their role-specific room
    socket.join(socket.userRole)

    // Join customer to their personal room for order updates
    if (socket.userRole === 'customer') {
      socket.join(`customer_${socket.userId}`)
    }

    // Join partner to their personal room for order assignments
    if (socket.userRole === 'partner') {
      socket.join(`partner_${socket.userId}`)
    }

    // Handle joining order tracking room
    socket.on('join_order_tracking', (data) => {
      const { orderId } = data
      socket.join(`order_${orderId}`)
      console.log(`User ${socket.userId} joined tracking for order ${orderId}`)
      
      // Send current location if available
      if (partnerLocations.has(orderId)) {
        socket.emit('delivery_location_update', partnerLocations.get(orderId))
      }
    })

    // Handle order status updates
    socket.on('order_status_update', async (data) => {
      try {
        const { orderId, status, description } = data
        
        // Store order status
        activeOrders.set(orderId, { status, description, timestamp: new Date() })
        
        // Emit to all users tracking this order
        io.to(`order_${orderId}`).emit('order_status_update', {
          orderId,
          status,
          description,
          timestamp: new Date()
        })

        // Emit to customer who placed the order
        socket.to(`customer_${socket.userId}`).emit('order_updated', {
          orderId,
          status,
          description,
          timestamp: new Date()
        })

        // Emit to admin dashboard
        socket.to('admin').emit('order_status_changed', {
          orderId,
          status,
          description,
          timestamp: new Date()
        })
      } catch (error) {
        console.error('Order status update error:', error)
      }
    })

    // Handle partner location updates
    socket.on('partner_location_update', (data) => {
      const { orderId, lat, lng, status } = data
      
      const locationData = {
        orderId,
        lat,
        lng,
        status: status || 'in_transit',
        timestamp: new Date()
      }
      
      // Store partner location
      partnerLocations.set(orderId, locationData)
      
      // Notify all users tracking this order
      io.to(`order_${orderId}`).emit('delivery_location_update', locationData)
      
      // Notify customer about delivery location
      socket.to(`customer_${socket.userId}`).emit('delivery_location_update', locationData)
    })

    // Handle new order notifications
    socket.on('new_order', (orderData) => {
      // Notify all available partners
      socket.to('partner').emit('new_order_available', orderData)
      
      // Notify admin
      socket.to('admin').emit('new_order_created', orderData)
    })

    // Handle order acceptance
    socket.on('order_accepted', (data) => {
      const { orderId, partnerId, customerId } = data
      
      // Notify customer
      socket.to(`customer_${customerId}`).emit('order_accepted', {
        orderId,
        partnerId,
        timestamp: new Date()
      })

      // Notify admin
      socket.to('admin').emit('order_accepted', {
        orderId,
        partnerId,
        timestamp: new Date()
      })

      // Notify other partners that order is no longer available
      socket.to('partner').emit('order_unavailable', { orderId })
    })

    // Simulate delivery tracking for demo
    socket.on('start_delivery_simulation', (data) => {
      const { orderId } = data
      
      // Simulate delivery partner movement
      const deliveryRoute = [
        { lat: 40.7589, lng: -73.9851, status: 'picked_up' },
        { lat: 40.7614, lng: -73.9776, status: 'in_transit' },
        { lat: 40.7505, lng: -73.9934, status: 'in_transit' },
        { lat: 40.7128, lng: -74.0060, status: 'arrived' },
        { lat: 40.7128, lng: -74.0060, status: 'delivered' }
      ]
      
      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex < deliveryRoute.length) {
          const location = deliveryRoute[currentIndex]
          const locationData = {
            orderId,
            lat: location.lat,
            lng: location.lng,
            status: location.status,
            timestamp: new Date()
          }
          
          // Store and emit location update
          partnerLocations.set(orderId, locationData)
          io.to(`order_${orderId}`).emit('delivery_location_update', locationData)
          
          // Update order status
          if (location.status === 'delivered') {
            io.to(`order_${orderId}`).emit('order_status_update', {
              orderId,
              status: 'delivered',
              description: 'Order has been delivered successfully',
              timestamp: new Date()
            })
            clearInterval(interval)
          }
          
          currentIndex++
        } else {
          clearInterval(interval)
        }
      }, 5000) // Update every 5 seconds
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`)
    })
  })

  return io
}

module.exports = { initializeSocket }

