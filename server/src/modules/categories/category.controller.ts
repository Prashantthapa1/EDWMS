import type { Request, Response, NextFunction } from "express";
import { categoryService } from "./category.service.js";
import type { CategoryFilters } from "src/types/category.types.js";

class CategoryController {
    
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search : undefined;
            const isActive =
                req.query.is_active === 'true'
                    ? true
                    : req.query.is_active === 'false'
                      ? false
                      : undefined;

            const filters: CategoryFilters = {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 10,
                sortBy: (req.query.sortBy as string) || 'name',
                sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
                ...(search !== undefined ? { search } : {}),
                ...(isActive !== undefined ? { is_active: isActive } : {})
            };

            const result = await categoryService.getAll(filters);
            
            res.status(200).json({
                success: true,
                message: "Categories retrieved successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const category = await categoryService.getById(id as string);
            
            res.status(200).json({
                success: true,
                message: "Category retrieved successfully",
                data: category
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await categoryService.create(req.body);
            
            res.status(201).json({
                success: true,
                message: "Category created successfully",
                data: category
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const category = await categoryService.update(id as string, req.body);
            
            res.status(200).json({
                success: true,
                message: "Category updated successfully",
                data: category
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await categoryService.delete(id as string);
            
            res.status(200).json({
                success: true,
                message: "Category deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    }

    async toggleActive(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { is_active } = req.body;
            const category = await categoryService.toggleActive(id as string, is_active);
            
            res.status(200).json({
                success: true,
                message: `Category ${is_active ? 'activated' : 'deactivated'} successfully`,
                data: category
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllActive(_req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await categoryService.getAllActive();
            
            res.status(200).json({
                success: true,
                message: "Active categories retrieved successfully",
                data: categories
            });
        } catch (error) {
            next(error);
        }
    }

    async getStats(_req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await categoryService.getStats();
            
            res.status(200).json({
                success: true,
                message: "Category stats retrieved successfully",
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

export const categoryController = new CategoryController();
