import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [orderStatus, setOrderStatus] = useState(null)

  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket']
    })

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server')
      setConnected(true)
      setSocket(newSocket)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
      setConnected(false)
    })

    // Listen for delivery location updates
    newSocket.on('delivery_location_update', (data) => {
      console.log('Delivery location update:', data)
      setDeliveryLocation(data)
    })

    // Listen for order status updates
    newSocket.on('order_status_update', (data) => {
      console.log('Order status update:', data)
      setOrderStatus(data)
    })

    // Listen for delivery partner updates
    newSocket.on('partner_location_update', (data) => {
      console.log('Partner location update:', data)
      setDeliveryLocation(data)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const emitEvent = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data)
    }
  }

  const value = {
    socket,
    connected,
    deliveryLocation,
    orderStatus,
    emitEvent
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
