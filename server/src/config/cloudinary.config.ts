import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.config.js';

// Configure Cloudinary
const isConfigured = !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_KEY && env.CLOUDINARY_SECRET);

if (isConfigured) {
    cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME as string,
        api_key: env.CLOUDINARY_KEY as string,
        api_secret: env.CLOUDINARY_SECRET as string,
        secure: true
    });
    console.log('✅ Cloudinary configured successfully');
} else {
    console.warn('⚠️ Cloudinary not configured. File uploads will use local storage fallback.');
}

export const isCloudinaryConfigured = isConfigured;
export default cloudinary;
