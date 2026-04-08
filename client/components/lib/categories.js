import { api } from './api';

/**
 * Get all categories with optional filters and pagination
 * @param {object} params - Query parameters
 * @returns {Promise<object>} - Paginated category list
 */
export async function getCategories(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (typeof params.is_active === 'boolean') queryParams.append('is_active', params.is_active);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const path = queryString ? `/categories?${queryString}` : '/categories';
    
    return api.get(path, { useAuth: true });
}

/**
 * Get all active categories (for dropdowns)
 * @returns {Promise<object>} - List of active categories
 */
export async function getActiveCategories() {
    return api.get('/categories/active', { useAuth: true });
}

/**
 * Get category by ID
 * @param {string} id - Category ID
 * @returns {Promise<object>} - Category data
 */
export async function getCategoryById(id) {
    return api.get(`/categories/${id}`, { useAuth: true });
}

/**
 * Create a new category
 * @param {object} categoryData - Category data
 * @returns {Promise<object>} - Created category
 */
export async function createCategory(categoryData) {
    return api.post('/categories', categoryData, { useAuth: true });
}

/**
 * Update a category
 * @param {string} id - Category ID
 * @param {object} categoryData - Category data to update
 * @returns {Promise<object>} - Updated category
 */
export async function updateCategory(id, categoryData) {
    return api.put(`/categories/${id}`, categoryData, { useAuth: true });
}

/**
 * Delete a category
 * @param {string} id - Category ID
 * @returns {Promise<object>} - Success response
 */
export async function deleteCategory(id) {
    return api.delete(`/categories/${id}`, { useAuth: true });
}

/**
 * Toggle category active status
 * @param {string} id - Category ID
 * @param {boolean} isActive - New active status
 * @returns {Promise<object>} - Updated category
 */
export async function toggleCategoryActive(id, isActive) {
    return api.patch(`/categories/${id}/toggle-active`, { is_active: isActive }, { useAuth: true });
}

/**
 * Get category statistics
 * @returns {Promise<object>} - Category stats
 */
export async function getCategoryStats() {
    return api.get('/categories/stats', { useAuth: true });
}
