import crypto from 'crypto';

export const generateUUID = () => {
    return crypto.randomUUID();
}