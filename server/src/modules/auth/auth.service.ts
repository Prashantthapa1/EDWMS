import { ApiError, badRequest, conflictError, internalError, notFound } from "src/errors/ApiError.js";
import type { AuthResponse, deviceMetadata, LoginDTO, PublicUser, registerUserDTO } from "src/types/auth.types.js";
import { authRepository } from "./auth.repository.js";
import { comparePassword, hashPassword } from "@utils/password.js";
import { generateUUID } from "@utils/uuid.js";
import { generateTokens, verifyRefreshToken } from "@utils/jwt.utils.js";

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

class AuthService {

    async registerUser(registerInfo: registerUserDTO): Promise<AuthResponse> {
        try {
            console.log("entered service layer")
            const userExist = await authRepository.checkExisting(registerInfo.email);
            if(userExist) {
                console.log("Email exists");
                throw new conflictError("Email already exists");
            };

            const token_id = generateUUID();
            const session_id = generateUUID();

            const hashedPassword = await hashPassword(registerInfo.newPassword);

            const user: PublicUser = await authRepository.createUser({ 
                name: registerInfo.name,
                email: registerInfo.email,
                password: hashedPassword
            });

            const tokens = generateTokens(
                {
                    id: user.id,
                    email: user.email,
                    role_id: user.role_id
                }, 
                {
                    id: user.id,
                    token_id: token_id,
                }
            );

            const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await authRepository.createSession({
                id: session_id,
                user_id: user.id,
                ip_address: '0.0.0.0',
                expires_at: sessionExpiry
            });

            await authRepository.storeRefreshTokens({
                id: token_id,
                user_id: user.id,
                token_hash: tokens.refreshTokenHash,
                session_id: session_id
            });

            return { 
                user, 
                tokens: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken
                }
            };
        } catch(err) {
            console.log("Error registering user", err);
            if(err instanceof ApiError) throw err;
            throw new internalError("Error registering user");
        }
    }

    async loginUser(loginInfo: LoginDTO, deviceInfo?: deviceMetadata): Promise<AuthResponse> {
        try {
            const userInfo = await authRepository.findByEmail(loginInfo.email);
            if(!userInfo) {
                throw new notFound("Invalid Credentials");
            }

            if(userInfo.locked_until && new Date(userInfo.locked_until) > new Date()) {
                throw new badRequest("Account locked. Try again later.");
            }

            const isValid = await comparePassword(loginInfo.password, userInfo.password);
            if(!isValid) {
                const attempts = await authRepository.increaseFailedAttempt(userInfo.id);
                if(attempts >= MAX_FAILED) {
                    await authRepository.lockUntil(userInfo.id, LOCK_MINUTES);
                    throw new badRequest(`Account locked for ${LOCK_MINUTES} minutes.`);
                }
                throw new badRequest('Invalid credentials');
            }

            await authRepository.resetFailedLoginAttempts(userInfo.id);

            // if(!userInfo.is_active) {
            //     throw new forbidden("Account not active");
            // }

            const token_id = generateUUID();
            const session_id = generateUUID();

            const tokens = generateTokens(
                {
                    id: userInfo.id,
                    email: userInfo.email,
                    role_id: userInfo.role_id
                },
                {
                    id: userInfo.id,
                    token_id: token_id
                }
            );

            const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await authRepository.createSession({
                id: session_id as string,
                user_id: userInfo.id,
                device_info: deviceInfo?.user_agent,
                ip_address: deviceInfo?.ip,
                expires_at: sessionExpiry
            });

            await authRepository.storeRefreshTokens({
                id: token_id,
                user_id: userInfo.id,
                token_hash: tokens.refreshTokenHash,
                ip: deviceInfo?.ip,
                user_agent: deviceInfo?.user_agent,
                session_id: session_id
            });

            const { password, locked_until, google_id, ...user } = userInfo;

            return { 
                user: { ...user, role: userInfo.role?.toLowerCase() }, 
                tokens: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken
                }
            };
        } catch (err) {
            console.log("Error loggin user", err);
            if(err instanceof ApiError) throw err;
            throw new internalError("Internal Server Error in login");
        }
    }
    
    async logoutUser(refresh_token?: string): Promise<void> {
        if (!refresh_token) return;
        try {
            const payload = verifyRefreshToken(refresh_token);
            const row = await authRepository.findRefreshToken(payload.token_id);
            if (row?.session_id) {
                await authRepository.deactivateSession(row.session_id);
            }
            await authRepository.revokeRefreshToken(payload.token_id);
        } catch {
            
        }
    }

    async refreshTokens(refresh_token: string, deviceInfo?: deviceMetadata): Promise<AuthResponse> {

        const payload = verifyRefreshToken(refresh_token);

        const row = await authRepository.findRefreshToken(payload.token_id);

        if (!row || row.is_revoked || new Date(row.expires_at) < new Date()) {
            throw new notFound('Refresh token invalid or expired');
        }

        if (row.session_id) {
            const session = await authRepository.findActiveSession(row.session_id);
            if (!session || !session.is_active || new Date(session.expires_at) < new Date()) {
                throw new badRequest('Session expired. Please log in again.');
            }
        }

        // detect reuse: hash presented token and compare
        const { createHash, timingSafeEqual } = await import('crypto');
        const presented = Buffer.from(
            createHash('sha256').update(refresh_token).digest('hex')
        );
        const stored = Buffer.from(row.token_hash);
        const match = presented.length === stored.length && timingSafeEqual(presented, stored);

        if (!match) {
            // token reuse — revoke all tokens for this user and force re-login
            await authRepository.revokeAllRefreshToken(row.user_id);
            throw new badRequest('Token reuse detected. Please log in again.');
        }

        await authRepository.revokeRefreshToken(payload.token_id);

        const userInfo = await authRepository.findById(row.user_id);
        if (!userInfo) throw new notFound('User not found');

        const new_token_id = generateUUID();
        const tokens = generateTokens(
            { id: userInfo.id, email: userInfo.email, role_id: userInfo.role_id },
            { id: userInfo.id, token_id: new_token_id }
        );

        await authRepository.storeRefreshTokens({
            id: new_token_id,
            user_id: userInfo.id,
            token_hash: tokens.refreshTokenHash,
            ip: deviceInfo?.ip,
            user_agent: deviceInfo?.user_agent,
            session_id: row.session_id  // keep the same session
        });

        if (row.session_id) {
            await authRepository.updateSessionLastActive(row.session_id);
        }

        const { password, locked_until, google_id, failed_login_attempts, ...user } = userInfo;

        return {
            user: user as PublicUser,
            tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
        };
    }
    
}

export const authService = new AuthService();