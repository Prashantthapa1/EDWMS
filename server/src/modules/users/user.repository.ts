import { pool } from "@config/database.config.js";
import type { 
    UserFilters, 
    CreateUserDTO, 
    UpdateUserDTO, 
    UserResponse, 
    PaginatedResponse,
    RoleResponse,
    DepartmentResponse 
} from "src/types/user.types.js";

class UserRepository {
    
    async findAll(filters: UserFilters): Promise<PaginatedResponse<UserResponse>> {
        const {
            search,
            role_id,
            dep_id,
            is_active,
            page = 1,
            limit = 10,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = filters;

        const offset = (page - 1) * limit;
        const conditions: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (search) {
            conditions.push(`(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
            values.push(`%${search}%`);
            paramIndex++;
        }

        if (role_id) {
            conditions.push(`u.role_id = $${paramIndex}`);
            values.push(role_id);
            paramIndex++;
        }

        if (dep_id) {
            conditions.push(`u.dep_id = $${paramIndex}`);
            values.push(dep_id);
            paramIndex++;
        }

        if (typeof is_active === 'boolean') {
            conditions.push(`u.is_active = $${paramIndex}`);
            values.push(is_active);
            paramIndex++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        
        // Validate sortBy to prevent SQL injection
        const allowedSortColumns = ['name', 'email', 'created_at', 'updated_at', 'is_active'];
        const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM users u 
            ${whereClause}
        `;
        const countResult = await pool.query(countQuery, values);
        const total = parseInt(countResult.rows[0].total);

        // Get paginated data
        const dataQuery = `
            SELECT 
                u.id, u.name, u.email, u.role_id, r.name as role,
                u.dep_id, d.name as department, u.is_active, u.address,
                u.phone_number, u.avatar_url, u.email_verified,
                u.auth_provider, u.created_at, u.updated_at
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN departments d ON u.dep_id = d.id
            ${whereClause}
            ORDER BY u.${safeSortBy} ${safeSortOrder}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        
        const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

        return {
            data: dataResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findById(id: string): Promise<UserResponse | null> {
        const query = `
            SELECT 
                u.id, u.name, u.email, u.role_id, r.name as role,
                u.dep_id, d.name as department, u.is_active, u.address,
                u.phone_number, u.avatar_url, u.email_verified,
                u.auth_provider, u.created_at, u.updated_at
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN departments d ON u.dep_id = d.id
            WHERE u.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async findByEmail(email: string): Promise<UserResponse | null> {
        const query = `SELECT * FROM users WHERE email = $1`;
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    }

    async create(data: CreateUserDTO): Promise<UserResponse> {
        const query = `
            INSERT INTO users (id, name, email, password, role_id, dep_id, address, phone_number, is_active, created_at, updated_at)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING id
        `;
        const result = await pool.query(query, [
            data.name,
            data.email,
            data.password,
            data.role_id,
            data.dep_id || null,
            data.address || null,
            data.phone_number || null,
            data.is_active ?? true
        ]);

        return this.findById(result.rows[0].id) as Promise<UserResponse>;
    }

    async update(id: string, data: UpdateUserDTO): Promise<UserResponse | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(data.name);
        }
        if (data.email !== undefined) {
            updates.push(`email = $${paramIndex++}`);
            values.push(data.email);
        }
        if (data.password !== undefined) {
            updates.push(`password = $${paramIndex++}`);
            values.push(data.password);
        }
        if (data.role_id !== undefined) {
            updates.push(`role_id = $${paramIndex++}`);
            values.push(data.role_id);
        }
        if (data.dep_id !== undefined) {
            updates.push(`dep_id = $${paramIndex++}`);
            values.push(data.dep_id);
        }
        if (data.address !== undefined) {
            updates.push(`address = $${paramIndex++}`);
            values.push(data.address);
        }
        if (data.phone_number !== undefined) {
            updates.push(`phone_number = $${paramIndex++}`);
            values.push(data.phone_number);
        }
        if (data.is_active !== undefined) {
            updates.push(`is_active = $${paramIndex++}`);
            values.push(data.is_active);
        }
        if (data.avatar_url !== undefined) {
            updates.push(`avatar_url = $${paramIndex++}`);
            values.push(data.avatar_url);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const query = `
            UPDATE users 
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING id
        `;

        const result = await pool.query(query, values);
        if (result.rows.length === 0) return null;

        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const query = `DELETE FROM users WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [id]);
        return result.rows.length > 0;
    }

    async toggleActive(id: string, is_active: boolean): Promise<UserResponse | null> {
        const query = `
            UPDATE users 
            SET is_active = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id
        `;
        const result = await pool.query(query, [is_active, id]);
        if (result.rows.length === 0) return null;

        return this.findById(id);
    }

    async getAllRoles(): Promise<RoleResponse[]> {
        const query = `SELECT id, name, description, is_active FROM roles WHERE is_active = true ORDER BY name`;
        const result = await pool.query(query);
        return result.rows;
    }

    async getAllDepartments(): Promise<DepartmentResponse[]> {
        const query = `SELECT id, name, description, is_active FROM departments WHERE is_active = true ORDER BY name`;
        const result = await pool.query(query);
        return result.rows;
    }

    async getStats(): Promise<{ total: number; active: number; inactive: number }> {
        const query = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE is_active = true) as active,
                COUNT(*) FILTER (WHERE is_active = false) as inactive
            FROM users
        `;
        const result = await pool.query(query);
        return {
            total: parseInt(result.rows[0].total),
            active: parseInt(result.rows[0].active),
            inactive: parseInt(result.rows[0].inactive)
        };
    }
}

export const userRepository = new UserRepository();
