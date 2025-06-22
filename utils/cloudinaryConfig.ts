// cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

/**
 * Validates that required Cloudinary environment variables are defined.
 * This prevents runtime errors due to missing configuration and helps with early debugging.
 */
const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
];

requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

/**
 * Configure the Cloudinary SDK using environment variables.
 * These credentials must be securely stored and never exposed on the client side.
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Export the configured Cloudinary instance for use across the application.
 * This allows centralized control and reuse of the SDK configuration.
 */
export { cloudinary };
