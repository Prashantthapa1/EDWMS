import { categoryRepository } from "./category.repository.js";
import { ApiError } from "src/errors/ApiError.js";
import type { 
    CategoryFilters, 
    CreateCategoryDTO, 
    UpdateCategoryDTO, 
    CategoryResponse, 
    PaginatedCategoryResponse 
} from "src/types/category.types.js";

class CategoryService {
    
    async getAll(filters: CategoryFilters): Promise<PaginatedCategoryResponse> {
        return categoryRepository.findAll(filters);
    }

    async getById(id: string): Promise<CategoryResponse> {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new ApiError("Category not found", 404);
        }
        return category;
    }

    async create(data: CreateCategoryDTO): Promise<CategoryResponse> {
        // Check if category with same name exists
        const existing = await categoryRepository.findByName(data.name);
        if (existing) {
            throw new ApiError("Category with this name already exists", 400);
        }

        return categoryRepository.create(data);
    }

    async update(id: string, data: UpdateCategoryDTO): Promise<CategoryResponse> {
        // Check if category exists
        const existing = await categoryRepository.findById(id);
        if (!existing) {
            throw new ApiError("Category not found", 404);
        }

        // If name is being updated, check for duplicates
        if (data.name && data.name !== existing.name) {
            const duplicate = await categoryRepository.findByName(data.name);
            if (duplicate) {
                throw new ApiError("Category with this name already exists", 400);
            }
        }

        const updated = await categoryRepository.update(id, data);
        if (!updated) {
            throw new ApiError("Failed to update category", 500);
        }

        return updated;
    }

    async delete(id: string): Promise<void> {
        const existing = await categoryRepository.findById(id);
        if (!existing) {
            throw new ApiError("Category not found", 404);
        }

        const deleted = await categoryRepository.delete(id);
        if (!deleted) {
            throw new ApiError("Cannot delete category with active documents. Remove or reassign documents first.", 400);
        }
    }

    async toggleActive(id: string, is_active: boolean): Promise<CategoryResponse> {
        const existing = await categoryRepository.findById(id);
        if (!existing) {
            throw new ApiError("Category not found", 404);
        }

        const updated = await categoryRepository.toggleActive(id, is_active);
        if (!updated) {
            throw new ApiError("Failed to update category status", 500);
        }

        return updated;
    }

    async getAllActive(): Promise<CategoryResponse[]> {
        return categoryRepository.getAllActive();
    }

    async getStats(): Promise<{ total: number; active: number; inactive: number }> {
        return categoryRepository.getStats();
    }
}

export const categoryService = new CategoryService();
