import type { Request, Response, NextFunction } from 'express';
import { ApiError } from 'src/errors/ApiError.js';
import z, { ZodError } from 'zod';

export const Validate = (schema: z.ZodObject<any>) => {
    return async (
        req: Request,
        _res: Response,
        next: NextFunction
    ) => {
        try {
            const validatedData = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
                cookies: req.cookies
            });
    
            if(validatedData.body) {
                console.log(validatedData.body);
                req.body = validatedData.body;
            }

            if(validatedData.query) {
                console.log(validatedData.query);
                Object.assign(req.query, validatedData.query);
            }

            if(validatedData.params) {
                console.log(validatedData.params);
                Object.assign(req.params, validatedData.params);
            }

            if(validatedData.cookies) {
                console.log(validatedData.cookies);
                Object.assign(req.cookies, validatedData.cookies);
            }
            next();
        } catch (err) {
            if(err instanceof ZodError) {
                const errors = err.issues.map((e) => ({
                    field: e.path.join(".") || "root",
                    message: e.message
                }));
                next(new ApiError(err.message, 400, errors));
            } else {
                next(err);
            }
        }
    }
}   