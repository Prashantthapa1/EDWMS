import { api } from './api';

/**
 * Get all users with optional filters and pagination
 * @param {object} params - Query parameters
 * @returns {Promise<object>} - Paginated user list
 */
export async function getUsers(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.role_id) queryParams.append('role_id', params.role_id);
    if (params.dep_id) queryParams.append('dep_id', params.dep_id);
    if (typeof params.is_active === 'boolean') queryParams.append('is_active', params.is_active);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const path = queryString ? `/users?${queryString}` : '/users';
    
    return api.get(path, { useAuth: true });
}

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<object>} - User data
 */
export async function getUserById(id) {
    return api.get(`/users/${id}`, { useAuth: true });
}

/**
 * Create a new user
 * @param {object} userData - User data
 * @returns {Promise<object>} - Created user
 */
export async function createUser(userData) {
    return api.post('/users', userData, { useAuth: true });
}

/**
 * Update a user
 * @param {string} id - User ID
 * @param {object} userData - User data to update
 * @returns {Promise<object>} - Updated user
 */
export async function updateUser(id, userData) {
    return api.put(`/users/${id}`, userData, { useAuth: true });
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise<object>} - Success response
 */
export async function deleteUser(id) {
    return api.delete(`/users/${id}`, { useAuth: true });
}

/**
 * Toggle user active status
 * @param {string} id - User ID
 * @param {boolean} isActive - New active status
 * @returns {Promise<object>} - Updated user
 */
export async function toggleUserActive(id, isActive) {
    return api.patch(`/users/${id}/toggle-active`, { is_active: isActive }, { useAuth: true });
}

/**
 * Get all roles
 * @returns {Promise<object>} - List of roles
 */
export async function getRoles() {
    return api.get('/users/roles', { useAuth: true });
}

/**
 * Get all departments
 * @returns {Promise<object>} - List of departments
 */
export async function getDepartments() {
    return api.get('/users/departments', { useAuth: true });
}

/**
 * Get user statistics
 * @returns {Promise<object>} - User stats
 */
export async function getUserStats() {
    return api.get('/users/stats', { useAuth: true });
}
