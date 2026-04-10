// User Management Types

export interface UserFilters {
    search?: string;
    role_id?: string;
    dep_id?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CreateUserDTO {
    name: string;
    email: string;
    password: string;
    role_id: string;
    dep_id?: string;
    address?: string;
    phone_number?: string;
    is_active?: boolean;
}

export interface UpdateUserDTO {
    name?: string;
    email?: string;
    password?: string;
    role_id?: string;
    dep_id?: string;
    address?: string;
    phone_number?: string;
    is_active?: boolean;
    avatar_url?: string;
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    role_id: string;
    role?: string;
    dep_id?: string | null;
    department?: string | null;
    is_active: boolean;
    address?: string | null;
    phone_number?: string | null;
    avatar_url?: string | null;
    email_verified: boolean;
    auth_provider: string;
    created_at: Date;
    updated_at: Date;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface RoleResponse {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
}

export interface DepartmentResponse {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
}
