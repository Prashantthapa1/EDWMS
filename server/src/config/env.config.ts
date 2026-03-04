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
    DB_NAME: z.string()

});

const parsed = envSchema.safeParse(process.env);
console.log("parsed: ", parsed.data?.DB_HOST);
console.log("parsed: ", parsed.data?.DB_PORT);
console.log("parsed: ", parsed.data?.DB_USER);
console.log("parsed: ", parsed.data?.DB_PASS);
console.log("parsed: ", parsed.data?.DB_NAME);

if (!parsed.success) {
    console.error('Failed to parse environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data!;

export default env;