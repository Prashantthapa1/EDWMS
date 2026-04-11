import cloudinary, { isCloudinaryConfigured } from '@config/cloudinary.config.js';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { ApiError } from 'src/errors/ApiError.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local uploads directory (fallback when Cloudinary is not configured)
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface UploadResult {
    public_id: string;
    url: string;
    secure_url: string;
    format: string;
    resource_type: string;
    bytes: number;
    original_filename: string;
}

export interface FileUploadOptions {
    folder?: string;
    resource_type?: 'auto' | 'image' | 'video' | 'raw';
    public_id?: string;
}

class FileUploadService {
    
    async uploadBuffer(
        buffer: Buffer,
        originalFilename: string,
        options: FileUploadOptions = {}
    ): Promise<UploadResult> {
        const folder = options.folder || 'documents';
        const resource_type = options.resource_type || 'auto';
        
        if (isCloudinaryConfigured) {
            return this.uploadToCloudinary(buffer, originalFilename, folder, resource_type);
        } else {
            return this.uploadToLocal(buffer, originalFilename, folder);
        }
    }
    
    private async uploadToCloudinary(
        buffer: Buffer,
        originalFilename: string,
        folder: string,
        resource_type: 'auto' | 'image' | 'video' | 'raw'
    ): Promise<UploadResult> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `edwms/${folder}`,
                    resource_type,
                    use_filename: true,
                    unique_filename: true
                },
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (error) {
                        reject(new ApiError(`Upload failed: ${error.message}`, 500));
                    } else if (result) {
                        resolve({
                            public_id: result.public_id,
                            url: result.url,
                            secure_url: result.secure_url,
                            format: result.format,
                            resource_type: result.resource_type,
                            bytes: result.bytes,
                            original_filename: originalFilename
                        });
                    } else {
                        reject(new ApiError('Upload failed: No result returned', 500));
                    }
                }
            );
            
            uploadStream.end(buffer);
        });
    }
    
    private async uploadToLocal(
        buffer: Buffer,
        originalFilename: string,
        folder: string
    ): Promise<UploadResult> {
        const folderPath = path.join(UPLOADS_DIR, folder);
        
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        
        // Generate unique filename
        const ext = path.extname(originalFilename);
        const baseName = path.basename(originalFilename, ext);
        const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
        const filename = `${baseName}-${uniqueId}${ext}`;
        const filePath = path.join(folderPath, filename);
        
        // Write file
        fs.writeFileSync(filePath, buffer);
        
        // Generate public ID and URL for local storage
        const public_id = `local/${folder}/${filename}`;
        const url = `/uploads/${folder}/${filename}`;
        
        return {
            public_id,
            url,
            secure_url: url,
            format: ext.replace('.', ''),
            resource_type: 'raw',
            bytes: buffer.length,
            original_filename: originalFilename
        };
    }
    
    async deleteFile(publicId: string): Promise<boolean> {
        if (publicId.startsWith('local/')) {
            return this.deleteLocalFile(publicId);
        }
        
        if (!isCloudinaryConfigured) {
            console.warn('Cannot delete from Cloudinary - not configured');
            return false;
        }
        
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result.result === 'ok';
        } catch (error) {
            console.error('Error deleting file from Cloudinary:', error);
            return false;
        }
    }
    
    private deleteLocalFile(publicId: string): boolean {
        try {
            // publicId format: local/folder/filename
            const relativePath = publicId.replace('local/', '');
            const filePath = path.join(UPLOADS_DIR, relativePath);
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting local file:', error);
            return false;
        }
    }
    
    async getFileUrl(publicId: string): Promise<string> {
        if (publicId.startsWith('local/')) {
            return publicId.replace('local', '/uploads');
        }
        
        if (!isCloudinaryConfigured) {
            return publicId;
        }
        
        return cloudinary.url(publicId, { secure: true });
    }
}

export const fileUploadService = new FileUploadService();
