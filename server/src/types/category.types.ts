// Category Management Types

export interface CategoryFilters {
    search?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CreateCategoryDTO {
    name: string;
    description?: string;
    is_active?: boolean;
}

export interface UpdateCategoryDTO {
    name?: string;
    description?: string;
    is_active?: boolean;
}

export interface CategoryResponse {
    id: string;
    name: string;
    description?: string | null;
    is_active: boolean;
    document_count?: number;
    created_at: Date;
    updated_at?: Date | null;
}

export interface PaginatedCategoryResponse {
    data: CategoryResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
