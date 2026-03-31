import { API_BASE } from './constants';
import { getToken, isTokenExpired, clearAuthData } from './utils';

/**
 * Generic fetch wrapper for API calls
 * @param {string} path - API endpoint path (e.g., '/auth/login')
 * @param {object} options - Fetch options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} options.body - Request body (will be JSON.stringified)
 * @param {object} options.headers - Additional headers
 * @param {boolean} options.useAuth - Whether to include auth token (default: false)
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiFetch(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    useAuth = false,
  } = options;

  // Build headers
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authorization header if requested
  if (useAuth) {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Build fetch options
  const fetchOptions = {
    method,
    headers: requestHeaders,
    credentials: 'include', // Important: Send cookies with requests
  };

  // Add body if present (only for POST, PUT, PATCH)
  if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, fetchOptions);
    
    // Parse JSON response
    const data = await response.json();

    // Handle non-2xx responses
    if (!response.ok) {
      // If unauthorized, clear auth data
      if (response.status === 401) {
        clearAuthData();
      }
      
      // Throw error with response data
      const error = new Error(data.message || 'API request failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Re-throw fetch errors
    if (error.message === 'Failed to fetch') {
      const networkError = new Error('Network error - cannot reach server');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: (path, options = {}) => apiFetch(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => apiFetch(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => apiFetch(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options = {}) => apiFetch(path, { ...options, method: 'PATCH', body }),
  delete: (path, options = {}) => apiFetch(path, { ...options, method: 'DELETE' }),
};
