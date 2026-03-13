import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import { ApiResponse } from "@utils/ApiResponse.js";
import { unathorized } from "src/errors/ApiError.js";
import type { LoginDTO, registerUserDTO } from "src/types/auth.types.js";
import env, { isProduction } from "@config/env.config.js";
import { asyncHandler } from "src/middlewares/asyncHandler.js";

const COOKIE_CONFIG = {
    httpOnly: true,
    secure: env.COOKIE_SECURE === 'true',
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
}

const ACCESS_COOKIE_OPTIONS = {
    ...COOKIE_CONFIG,
    maxAge: 15 * 60 * 1000
}

class AuthController {

    register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: registerUserDTO = req.body;
        const result =  await authService.registerUser(data);

        res.cookie('accessToken', result.tokens.accessToken, ACCESS_COOKIE_OPTIONS);
        res.cookie('refreshToken', result.tokens.refreshToken, COOKIE_CONFIG);

        res.status(201).json(
            ApiResponse.created(
                "User registered successfully",
                result
            )
        );
    });

    login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const data: LoginDTO = req.body;

        const result = await authService.loginUser(
            data, 
            {
                ip: req.ip,
                user_agent: req.headers['user-agent']
            }
        );

        res.cookie('accessToken', result.tokens.accessToken, ACCESS_COOKIE_OPTIONS);
        res.cookie('refreshToken', result.tokens.refreshToken, COOKIE_CONFIG);

        res.status(200).json(
            ApiResponse.success(
                "User logged in successfully",
                result
            )
        );
    });
  
    logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        await authService.logoutUser(req.cookies?.refreshToken);
        res.clearCookie('accessToken', ACCESS_COOKIE_OPTIONS);
        res.clearCookie('refreshToken', COOKIE_CONFIG);
        res.status(200).json(ApiResponse.success('User logged out successfully'));
    });

    refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const refreshToken: string | undefined = req.cookies?.refreshToken;
        if (!refreshToken) {
            throw new unathorized('No refresh token provided');
        }

        const result = await authService.refreshTokens(
            refreshToken,
            { ip: req.ip, user_agent: req.headers['user-agent'] }
        );

        res.cookie('accessToken', result.tokens.accessToken, ACCESS_COOKIE_OPTIONS);
        res.cookie('refreshToken', result.tokens.refreshToken, COOKIE_CONFIG);
        res.status(200).json(ApiResponse.success('Token refreshed', result));
    });

};

export const authController = new AuthController();