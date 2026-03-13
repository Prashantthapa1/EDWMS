import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError.js";
import { ZodError } from "zod";

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    // let statuscode = 500;
    let message = "Internal Server Error";

    if(err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message || message,
            errors: err.errors
        });
    }

    if(err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: err.message || "Validation failed"
        });
    }

    if(err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: err.message || "Duplicate value detected",
            errors: err.errors
        });
    };

    return res.status(500).json({
        success: false,
        message: err.message || "Unhanlded Error occurred",
    });
}