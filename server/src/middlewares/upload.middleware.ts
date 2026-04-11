import multer from 'multer';
import path from 'path';
import type { Request } from 'express';
import { ApiError } from 'src/errors/ApiError.js';

// Allowed file types for documents
const ALLOWED_MIMETYPES = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Archives
    'application/zip',
    'application/x-rar-compressed'
];

const ALLOWED_EXTENSIONS = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.txt', '.csv', '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.zip', '.rar'
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Storage configuration (memory storage for Cloudinary upload)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
        return cb(new ApiError(`File type ${file.mimetype} is not allowed`, 400));
    }
    
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new ApiError(`File extension ${ext} is not allowed`, 400));
    }
    
    cb(null, true);
};

// Single file upload
export const uploadSingle = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
}).single('file');

// Multiple files upload (max 5)
export const uploadMultiple = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 5
    }
}).array('files', 5);

// Get file extension from filename
export const getFileExtension = (filename: string): string => {
    return path.extname(filename).toLowerCase().replace('.', '');
};

// Get file type category
export const getFileTypeCategory = (mimetype: string): string => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.includes('pdf')) return 'pdf';
    if (mimetype.includes('word')) return 'document';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'spreadsheet';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'presentation';
    if (mimetype.includes('text')) return 'text';
    if (mimetype.includes('zip') || mimetype.includes('rar')) return 'archive';
    return 'other';
};

export { ALLOWED_MIMETYPES, ALLOWED_EXTENSIONS, MAX_FILE_SIZE };
