// API Configuration
// Backend defaults to PORT=4000 (see server/.env). You can override via NEXT_PUBLIC_API_URL.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL;
console.log("api base: ", API_BASE);

// LocalStorage Keys
export const TOKEN_KEY = 'edwms_token';
export const REFRESH_TOKEN_KEY = 'edwms_refresh_token';
export const USER_KEY = 'edwms_user';

// Cookie Names (must match backend)
export const ACCESS_COOKIE_NAME = 'accessToken';
export const REFRESH_COOKIE_NAME = 'refreshToken';
