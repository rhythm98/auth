// src/services/auth-service.js
import axios from 'axios'
import Keycloak from 'keycloak-js'

const API_URL = 'http://localhost:8080/api'
let keycloak = null

axios.defaults.withCredentials = true
// Create a custom Axios instance with credentials enabled
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

/**
 * Initialize Keycloak
 * @returns {Promise<Keycloak>} Keycloak instance
 */
export const initKeycloak = async () => {
  if (keycloak) {
    return keycloak
  }

  try {
    // Get Keycloak configuration from backend
    const response = await api.get('/auth/config')
    const { url, realm, clientId } = response.data.data
    // Adjust the URL based on Keycloak version
    const keycloakUrl = url.includes('/auth') ? url : url

    keycloak = new Keycloak({
      url: keycloakUrl, //  url: url.endsWith('/auth') ? url : `${url}/auth`,
      realm,
      clientId,
    })

    await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri:
        window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
    })

    // Set up token refresh
    setInterval(() => {
      keycloak.updateToken(70).catch(() => {
        console.error('Failed to refresh token')
      })
    }, 60000)

    return keycloak
  } catch (error) {
    console.error('Failed to initialize Keycloak:', error)
    throw error
  }
}

/**
 * Login using Keycloak
 * @returns {Promise<void>}
 */
export const login = async () => {
  if (!keycloak) {
    await initKeycloak()
  }

  return keycloak.login()
}

/**
 * Logout from Keycloak
 * @returns {Promise<void>}
 */
export const logout = async () => {
  if (!keycloak) {
    await initKeycloak()
  }

  return keycloak.logout()
}

/**
 * Register a new user
 * @param {Object} userData User data for registration
 * @returns {Promise<Object>} Response data
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

/**
 * Get authentication token
 * @returns {string|null} Token
 */
export const getToken = () => {
  return keycloak ? keycloak.token : null
}

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return keycloak ? keycloak.authenticated : false
}

/**
 * Get current user info from the token
 * @returns {Object|null} User info
 */
export const getUserInfo = () => {
  if (keycloak && keycloak.authenticated) {
    return {
      id: keycloak.subject,
      username: keycloak.tokenParsed.preferred_username,
      email: keycloak.tokenParsed.email,
      name: keycloak.tokenParsed.name,
      roles: keycloak.tokenParsed.realm_access?.roles || [],
    }
  }
  return null
}

/**
 * Get the current user profile from the API
 * @returns {Promise<Object>} User profile
 */
export const getUserProfile = async () => {
  try {
    const response = await authAxios.get(`${API_URL}/users/profile`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

/**
 * Update user profile
 * @param {Object} profileData Profile data to update
 * @returns {Promise<Object>} Updated profile
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await authAxios.put(
      `${API_URL}/users/profile`,
      profileData
    )
    return response.data.data
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Create axios instance with authentication header
export const authAxios = axios.create({
  baseURL: API_URL,
})

// Add authentication token to requests
authAxios.interceptors.request.use(
  async (config) => {
    if (keycloak && keycloak.authenticated) {
      // Refresh token if it's close to expiry
      try {
        await keycloak.updateToken(60)
        config.headers.Authorization = `Bearer ${keycloak.token}`
      } catch (error) {
        console.error('Failed to refresh token', error)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default {
  initKeycloak,
  login,
  logout,
  register,
  getToken,
  isAuthenticated,
  getUserInfo,
  getUserProfile,
  updateUserProfile,
  authAxios,
}
