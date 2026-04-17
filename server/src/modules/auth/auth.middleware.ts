import { verifyAccessToken } from "@utils/jwt.utils.js";
import type { Request, Response, NextFunction } from "express";
import { unauthorized } from "src/errors/ApiError.js";
import { asyncHandler } from "src/middlewares/asyncHandler.js";

export const authenticate = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) : Promise<void>=> {
        let token: string | undefined;

        const authHeader = req.headers.authorization;
        if(authHeader && authHeader.startsWith('Bearer')) {
            token = authHeader.split(' ')[1];
        } else {    
            token = req.cookies.accessToken;
        }

        if(!token) {
            throw new unauthorized("unauthorized");
        }

        const decoded = verifyAccessToken(token);
        if(!decoded || !decoded.id) {
            throw new unauthorized("Invalid token payload");
        }
        (req as any).user = decoded;

        next();
    }
)