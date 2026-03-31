import { api } from './api';
import { setToken, setRefreshToken, setUser, clearAuthData, getToken, getUser } from './utils';

/**
 * Register a new user
 * @param {object} data - Registration data
 * @param {string} data.name - Full name
 * @param {string} data.email - Email address
 * @param {string} data.password - Password
 * @returns {Promise<object>} - User data and tokens
 */
export async function register(data) {
  try {
    const response = await api.post('/auth/register', data);
    
    // Backend sends tokens in cookies, but also returns them
    if (response.data?.tokens) {
      setToken(response.data.tokens.accessToken);
      setRefreshToken(response.data.tokens.refreshToken);
    }
    
    // Store user data
    if (response.data?.user) {
      setUser(response.data.user);
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Login user
 * @param {object} credentials - Login credentials
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Password
 * @returns {Promise<object>} - User data and tokens
 */
export async function login(credentials) {
  try {
    const response = await api.post('/auth/login', credentials);
    
    // Backend sends tokens in cookies, but also returns them
    if (response.data?.tokens) {
      setToken(response.data.tokens.accessToken);
      setRefreshToken(response.data.tokens.refreshToken);
    }
    
    // Store user data
    if (response.data?.user) {
      setUser(response.data.user);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    // Call backend logout endpoint (clears cookies)
    await api.post('/auth/logout', {}, { useAuth: true });
  } catch (error) {
    console.error('Logout error:', error);
    // Continue with local cleanup even if API call fails
  } finally {
    // Clear local auth data
    clearAuthData();
  }
}

/**
 * Refresh access token
 * @returns {Promise<object>} - New tokens
 */
export async function refreshTokens() {
  try {
    const response = await api.post('/auth/refresh');
    
    // Update stored tokens
    if (response.data?.tokens) {
      setToken(response.data.tokens.accessToken);
      setRefreshToken(response.data.tokens.refreshToken);
    }
    
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    // If refresh fails, clear auth data
    clearAuthData();
    throw error;
  }
}

/**
 * Get current user data (from localStorage)
 * @returns {object|null} - User data or null
 */
export function getCurrentUser() {
  const token = getToken();
  if (!token) return null;
  
  // Return user from localStorage
  return getUser();
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = getToken();
  return !!token;
}
