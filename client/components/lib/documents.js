import { api } from './api';
import { API_BASE } from './constants';

/**
 * Get all documents with optional filters and pagination
 * @param {object} params - Query parameters
 * @returns {Promise<object>} - Paginated document list
 */
export async function getDocuments(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.department_id) queryParams.append('department_id', params.department_id);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.is_deleted) queryParams.append('is_deleted', params.is_deleted);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const path = queryString ? `/documents?${queryString}` : '/documents';
    
    return api.get(path, { useAuth: true });
}

/**
 * Get my documents (created by current user)
 * @param {object} params - Query parameters
 * @returns {Promise<object>} - Paginated document list
 */
export async function getMyDocuments(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const path = queryString ? `/documents/my?${queryString}` : '/documents/my';
    
    return api.get(path, { useAuth: true });
}

/**
 * Get document by ID
 * @param {string} id - Document ID
 * @returns {Promise<object>} - Document data with files
 */
export async function getDocumentById(id) {
    return api.get(`/documents/${id}`, { useAuth: true });
}

/**
 * Create a new document with optional files
 * @param {object} documentData - Document data
 * @param {File[]} files - Optional files to upload
 * @returns {Promise<object>} - Created document
 */
export async function createDocument(documentData, files = []) {
    const formData = new FormData();
    
    // Append document data
    Object.keys(documentData).forEach(key => {
        if (documentData[key] !== undefined && documentData[key] !== null) {
            formData.append(key, documentData[key]);
        }
    });
    
    // Append files
    files.forEach(file => {
        formData.append('files', file);
    });

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to create document');
    }
    return data;
}

/**
 * Update a document
 * @param {string} id - Document ID
 * @param {object} documentData - Document data to update
 * @returns {Promise<object>} - Updated document
 */
export async function updateDocument(id, documentData) {
    return api.put(`/documents/${id}`, documentData, { useAuth: true });
}

/**
 * Delete a document (soft delete by default)
 * @param {string} id - Document ID
 * @param {boolean} permanent - Whether to permanently delete
 * @returns {Promise<object>} - Success response
 */
export async function deleteDocument(id, permanent = false) {
    const path = permanent ? `/documents/${id}?permanent=true` : `/documents/${id}`;
    return api.delete(path, { useAuth: true });
}

/**
 * Restore a soft-deleted document
 * @param {string} id - Document ID
 * @returns {Promise<object>} - Restored document
 */
export async function restoreDocument(id) {
    return api.patch(`/documents/${id}/restore`, {}, { useAuth: true });
}

/**
 * Upload a file to a document
 * @param {string} documentId - Document ID
 * @param {File} file - File to upload
 * @param {boolean} isPrimary - Whether this should be the primary file
 * @returns {Promise<object>} - Uploaded file data
 */
export async function uploadDocumentFile(documentId, file, isPrimary = false) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_primary', isPrimary.toString());

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE}/documents/${documentId}/files`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to upload file');
    }
    return data;
}

/**
 * Delete a file from a document
 * @param {string} documentId - Document ID
 * @param {string} fileId - File ID
 * @returns {Promise<object>} - Success response
 */
export async function deleteDocumentFile(documentId, fileId) {
    return api.delete(`/documents/${documentId}/files/${fileId}`, { useAuth: true });
}

/**
 * Get download URL for a file
 * @param {string} documentId - Document ID
 * @param {string} fileId - File ID
 * @returns {string} - Download URL
 */
export function getFileDownloadUrl(documentId, fileId) {
    return `${API_BASE}/documents/${documentId}/files/${fileId}/download`;
}

/**
 * Get document versions
 * @param {string} documentId - Document ID
 * @returns {Promise<object>} - List of versions
 */
export async function getDocumentVersions(documentId) {
    return api.get(`/documents/${documentId}/versions`, { useAuth: true });
}

/**
 * Create a new version
 * @param {string} documentId - Document ID
 * @param {string} fileId - File ID to version
 * @param {File} file - New file
 * @param {string} changeSummary - Description of changes
 * @returns {Promise<object>} - Created version
 */
export async function createDocumentVersion(documentId, fileId, file, changeSummary) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('change_summary', changeSummary);

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE}/documents/${documentId}/files/${fileId}/versions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to create version');
    }
    return data;
}

/**
 * Get download URL for a specific version
 * @param {string} documentId - Document ID
 * @param {string} versionId - Version ID
 * @returns {string} - Download URL
 */
export function getVersionDownloadUrl(documentId, versionId) {
    return `${API_BASE}/documents/${documentId}/versions/${versionId}/download`;
}

/**
 * Get document statistics
 * @param {boolean} myOnly - Whether to get stats for current user only
 * @returns {Promise<object>} - Document stats
 */
export async function getDocumentStats(myOnly = false) {
    const path = myOnly ? '/documents/stats?my=true' : '/documents/stats';
    return api.get(path, { useAuth: true });
}

// Document status constants
export const DOCUMENT_STATUS = {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    UNDER_REVIEW: 'UNDER_REVIEW',
    REVISION: 'REVISION',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};

// Document priority constants
export const DOCUMENT_PRIORITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH'
};

// Status colors for UI
export const STATUS_COLORS = {
    DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700' },
    SUBMITTED: { bg: 'bg-blue-100', text: 'text-blue-700' },
    UNDER_REVIEW: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    REVISION: { bg: 'bg-orange-100', text: 'text-orange-700' },
    APPROVED: { bg: 'bg-green-100', text: 'text-green-700' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-700' }
};

// Priority colors for UI
export const PRIORITY_COLORS = {
    LOW: { bg: 'bg-slate-100', text: 'text-slate-700' },
    MEDIUM: { bg: 'bg-amber-100', text: 'text-amber-700' },
    HIGH: { bg: 'bg-red-100', text: 'text-red-700' }
};
