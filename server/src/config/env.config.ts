import z from 'zod';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load from server/.env regardless of working directory, overriding any system env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

const envSchema = z.object({
    PORT: z.coerce.number().int().default(3000),
    // node env
    NODE_ENV: z.enum(['production', 'development']).default('development'),

    // database
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.string().default('5432'),
    DB_USER: z.string(),
    DB_PASS: z.string(),
    DB_NAME: z.string(),

    // jwt
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('15min'),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // cookie
    COOKIE_SECURE: z.string(),

    // Cloudinary (optional - for file uploads)
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_KEY: z.string().optional(),
    CLOUDINARY_SECRET: z.string().optional(),
    CLOUDINARY_FOLDER: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Failed to parse environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data!;

export default env;

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';