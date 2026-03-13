import type { Request, Response, NextFunction, RequestHandler } from "express"

export const asyncHandler = (fn: Function): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    }
}