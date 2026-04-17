import env from '@config/env.config.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { RefreshTokenPayload, TokenPayload } from 'src/types/auth.types.js';

export const generateToken = (tokenPayload: TokenPayload) => {
    return jwt.sign(
        tokenPayload,
        env.JWT_SECRET,
        {
            expiresIn: env.JWT_EXPIRES_IN as any,
            algorithm: 'HS256'
        }
    );
}

export const generateRefreshToken = (refreshPayload: RefreshTokenPayload) => {
    return jwt.sign(
        refreshPayload,
        env.JWT_REFRESH_SECRET,
        {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
            algorithm: 'HS256'
        }
    );
}

export const generateTokens = (accessPayload: TokenPayload, refreshPayload: RefreshTokenPayload) => {
    const accessToken = generateToken(accessPayload);
    const refreshToken = generateRefreshToken(refreshPayload);

    const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest("hex");
        
    return { accessToken, refreshToken, refreshTokenHash };
}

export const verifyAccessToken = (token: string): TokenPayload => {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        return decoded as TokenPayload;
    } catch (err) {
        if(err instanceof jwt.TokenExpiredError) {
            throw new Error("Access Token expired");
        }

        if(err instanceof jwt.JsonWebTokenError) {
            throw new Error("Invalid access token");
        }

        throw new Error("Token verification failed");
    }
}

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
    try {
        const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
        console.log("Decoded refresh: ", decoded);
        return decoded;
    } catch (err) {
        if(err instanceof jwt.TokenExpiredError) {
            throw new Error("Refresh Token expired");
        }

        if(err instanceof jwt.JsonWebTokenError) {
            throw new Error("Invalid refresh token");
        }

        throw new Error("Token verification failed");
    }
}