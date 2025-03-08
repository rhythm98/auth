// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react'
import AuthService, {
  initKeycloak,
  getUserInfo,
  isAuthenticated,
  login,
  logout,
  register,
  getUserProfile,
} from '../auth-service'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize Keycloak
  useEffect(() => {
    const init = async () => {
      try {
        setError(null)
        const keycloak = await initKeycloak()

        setInitialized(true)
        setAuthenticated(keycloak.authenticated)

        if (keycloak.authenticated) {
          setUser(getUserInfo())

          // Fetch user profile
          try {
            const profile = await getUserProfile()
            setUserProfile(profile)
          } catch (profileError) {
            console.error('Failed to fetch user profile:', profileError)
          }
        }

        // Update state when authentication state changes
        keycloak.onAuthSuccess = () => {
          setAuthenticated(true)
          setUser(getUserInfo())

          // Fetch user profile on auth success
          getUserProfile()
            .then((profile) => setUserProfile(profile))
            .catch((err) => console.error('Error fetching profile:', err))
        }

        keycloak.onAuthLogout = () => {
          setAuthenticated(false)
          setUser(null)
          setUserProfile(null)
        }

        keycloak.onTokenExpired = () => {
          keycloak.updateToken(30).catch(() => {
            // If token refresh fails, logout
            keycloak.logout()
          })
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        setError('Failed to initialize authentication system')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const handleLogin = async () => {
    try {
      setError(null)
      await login()
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please try again.')
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      setError(null)
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
      setError('Logout failed. Please try again.')
      throw error
    }
  }

  const handleRegister = async (userData) => {
    try {
      setError(null)
      const response = await register(userData)
      return response
    } catch (error) {
      console.error('Registration error:', error)
      setError(
        error.response?.data?.message ||
          'Registration failed. Please try again.'
      )
      throw error
    }
  }

  // Values to provide through context
  const value = {
    initialized,
    authenticated,
    user,
    userProfile,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    clearError: () => setError(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
