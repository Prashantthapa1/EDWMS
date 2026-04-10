import type { Request, Response } from "express";
import { userService } from "./user.service.js";
import { ApiResponse } from "@utils/ApiResponse.js";
import { asyncHandler } from "src/middlewares/asyncHandler.js";
import type { UserFilters } from "src/types/user.types.js";

class UserController {

    getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const search = typeof req.query.search === 'string' ? req.query.search : undefined;
        const role_id = typeof req.query.role_id === 'string' ? req.query.role_id : undefined;
        const dep_id = typeof req.query.dep_id === 'string' ? req.query.dep_id : undefined;
        const isActive =
            req.query.is_active === 'true'
                ? true
                : req.query.is_active === 'false'
                  ? false
                  : undefined;

        const filters: UserFilters = {
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 10,
            sortBy: (req.query.sortBy as string) || 'created_at',
            sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
            ...(search !== undefined ? { search } : {}),
            ...(role_id !== undefined ? { role_id } : {}),
            ...(dep_id !== undefined ? { dep_id } : {}),
            ...(isActive !== undefined ? { is_active: isActive } : {})
        };

        const result = await userService.getAllUsers(filters);

        res.status(200).json(
            ApiResponse.success("Users fetched successfully", result)
        );
    });

    getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const user = await userService.getUserById(id as string);

        res.status(200).json(
            ApiResponse.success("User fetched successfully", user)
        );
    });

    create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const user = await userService.createUser(req.body);

        res.status(201).json(
            ApiResponse.created("User created successfully", user)
        );
    });

    update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const user = await userService.updateUser(id as string, req.body);

        res.status(200).json(
            ApiResponse.success("User updated successfully", user)
        );
    });

    delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        await userService.deleteUser(id as string);

        res.status(200).json(
            ApiResponse.success("User deleted successfully")
        );
    });

    toggleActive = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { is_active } = req.body;
        
        const user = await userService.toggleUserActive(id as string, is_active);

        res.status(200).json(
            ApiResponse.success(`User ${is_active ? 'activated' : 'deactivated'} successfully`, user)
        );
    });

    getRoles = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
        const roles = await userService.getRoles();

        res.status(200).json(
            ApiResponse.success("Roles fetched successfully", roles)
        );
    });

    getDepartments = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
        const departments = await userService.getDepartments();

        res.status(200).json(
            ApiResponse.success("Departments fetched successfully", departments)
        );
    });

    getStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
        const stats = await userService.getStats();

        res.status(200).json(
            ApiResponse.success("User stats fetched successfully", stats)
        );
    });
}

export const userController = new UserController();
