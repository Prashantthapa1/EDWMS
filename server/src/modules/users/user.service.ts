import { ApiError, conflictError, internalError, notFound } from "src/errors/ApiError.js";
import { hashPassword } from "@utils/password.js";
import { userRepository } from "./user.repository.js";
import type { 
    UserFilters, 
    CreateUserDTO, 
    UpdateUserDTO, 
    UserResponse, 
    PaginatedResponse,
    RoleResponse,
    DepartmentResponse 
} from "src/types/user.types.js";

class UserService {

    async getAllUsers(filters: UserFilters): Promise<PaginatedResponse<UserResponse>> {
        try {
            return await userRepository.findAll(filters);
        } catch (err) {
            console.error("Error fetching users:", err);
            if (err instanceof ApiError) throw err;
            throw new internalError("Error fetching users");
        }
    }

    async getUserById(id: string): Promise<UserResponse> {
        try {
            const user = await userRepository.findById(id);
            if (!user) {
                throw new notFound("User not found");
            }
            return user;
        } catch (err) {
            console.error("Error fetching user:", err);
            if (err instanceof ApiError) throw err;
            throw new internalError("Error fetching user");
        }
    }

    async createUser(data: CreateUserDTO): Promise<UserResponse> {
        try {
            // Check if email already exists
            const existing = await userRepository.findByEmail(data.email);
            if (existing) {
                throw new conflictError("Email already exists");
            }

            // Hash password
            const hashedPassword = await hashPassword(data.password);

            const user = await userRepository.create({
                ...data,
                password: hashedPassword
            });

            return user;
        } catch (err) {
            console.error("Error creating user:", err);
            if (err instanceof ApiError) throw err;
            throw new internalError("Error creating user");
        }
    }

    async updateUser(id: string, data: UpdateUserDTO): Promise<UserResponse> {
        try {
            // Check if user exists
            const existing = await userRepository.findById(id);
            if (!existing) {
                throw new notFound("User not found");
            }

            // If updating email, check it's not taken by another user
            if (data.email && data.email !== existing.email) {
                const emailExists = await userRepository.findByEmail(data.email);
                if (emailExists) {
                    throw new conflictError("Email already exists");
                }
            }

            // Hash password if provided
            if (data.password) {
                data.password = await hashPassword(data.password);
            }

            const user = await userRepository.update(id, data);
            if (!user) {
                throw new notFound("User not found");
            }

            return user;
        } catch (err) {
            console.error("Error updating user:", err);
            if (err instanceof ApiError) throw err;
            throw new internalError("Error updating user");
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            const existing = await userRepository.findById(id);
            if (!existing) {
                throw new notFound("User not found");
            }

            const deleted = await userRepository.delete(id);
            if (!deleted) {
                throw new internalError("Failed to delete user");
            }
        } catch (err) {
            console.error("Error deleting user:", err);
            if (err instanceof ApiError) throw err;
            throw new internalError("Error deleting user");
        }
    }

    async toggleUserActive(id: string, is_active: boolean): Promise<UserResponse> {
        try {
            const user = await userRepository.toggleActive(id, is_active);
            if (!user) {
                throw new notFound("User not found");
            }
            return user;
        } catch (err) {
            console.error("Error toggling user status:", err);
            if (err instanceof ApiError) throw err;
            throw new internalError("Error toggling user status");
        }
    }

    async getRoles(): Promise<RoleResponse[]> {
        try {
            return await userRepository.getAllRoles();
        } catch (err) {
            console.error("Error fetching roles:", err);
            throw new internalError("Error fetching roles");
        }
    }

    async getDepartments(): Promise<DepartmentResponse[]> {
        try {
            return await userRepository.getAllDepartments();
        } catch (err) {
            console.error("Error fetching departments:", err);
            throw new internalError("Error fetching departments");
        }
    }

    async getStats(): Promise<{ total: number; active: number; inactive: number }> {
        try {
            return await userRepository.getStats();
        } catch (err) {
            console.error("Error fetching user stats:", err);
            throw new internalError("Error fetching user stats");
        }
    }
}

export const userService = new UserService();
