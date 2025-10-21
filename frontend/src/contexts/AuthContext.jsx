import React, { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken)
        if (decodedToken.exp * 1000 > Date.now()) {
          setToken(storedToken)
          setUser(decodedToken)
        } else {
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.error('Invalid token:', error)
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password, userType) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, userType }),
      })

      const data = await response.json()

      if (response.ok) {
        const { token: newToken, user: userData } = data
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(userData)
        return { success: true, user: userData }
      } else {
        // Handle role-based access errors
        if (response.status === 403) {
          return { 
            success: false, 
            error: data.message || 'Access denied for this user type',
            userRole: data.userRole,
            requestedRole: data.requestedRole
          }
        }
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        const { token: newToken, user: userInfo } = data
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(userInfo)
        return { success: true, user: userInfo }
      } else {
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = () => {
    return !!token && !!user
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
