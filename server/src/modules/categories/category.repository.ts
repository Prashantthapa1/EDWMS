import { pool } from "@config/database.config.js";
import type { 
    CategoryFilters, 
    CreateCategoryDTO, 
    UpdateCategoryDTO, 
    CategoryResponse, 
    PaginatedCategoryResponse 
} from "src/types/category.types.js";

class CategoryRepository {
    
    async findAll(filters: CategoryFilters): Promise<PaginatedCategoryResponse> {
        const {
            search,
            is_active,
            page = 1,
            limit = 10,
            sortBy = 'name',
            sortOrder = 'asc'
        } = filters;

        const offset = (page - 1) * limit;
        const conditions: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (search) {
            conditions.push(`(c.name ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`);
            values.push(`%${search}%`);
            paramIndex++;
        }

        if (typeof is_active === 'boolean') {
            conditions.push(`c.is_active = $${paramIndex}`);
            values.push(is_active);
            paramIndex++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        
        // Validate sortBy to prevent SQL injection
        const allowedSortColumns = ['name', 'created_at', 'updated_at', 'is_active'];
        const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
        const safeSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM categories c 
            ${whereClause}
        `;
        const countResult = await pool.query(countQuery, values);
        const total = parseInt(countResult.rows[0].total);

        // Get paginated data with document count
        const dataQuery = `
            SELECT 
                c.id, c.name, c.description, c.is_active, 
                c.created_at, c.updated_at,
                COUNT(d.id) FILTER (WHERE d.deleted_at IS NULL) as document_count
            FROM categories c
            LEFT JOIN documents d ON c.id = d.category_id
            ${whereClause}
            GROUP BY c.id
            ORDER BY c.${safeSortBy} ${safeSortOrder}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        
        const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

        return {
            data: dataResult.rows.map(row => ({
                ...row,
                document_count: parseInt(row.document_count) || 0
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findById(id: string): Promise<CategoryResponse | null> {
        const query = `
            SELECT 
                c.id, c.name, c.description, c.is_active, 
                c.created_at, c.updated_at,
                COUNT(d.id) FILTER (WHERE d.deleted_at IS NULL) as document_count
            FROM categories c
            LEFT JOIN documents d ON c.id = d.category_id
            WHERE c.id = $1
            GROUP BY c.id
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return null;
        
        return {
            ...result.rows[0],
            document_count: parseInt(result.rows[0].document_count) || 0
        };
    }

    async findByName(name: string): Promise<CategoryResponse | null> {
        const query = `SELECT * FROM categories WHERE LOWER(name) = LOWER($1)`;
        const result = await pool.query(query, [name]);
        return result.rows[0] || null;
    }

    async create(data: CreateCategoryDTO): Promise<CategoryResponse> {
        const query = `
            INSERT INTO categories (id, name, description, is_active, created_at, updated_at)
            VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
            RETURNING id
        `;
        const result = await pool.query(query, [
            data.name,
            data.description || null,
            data.is_active ?? true
        ]);

        return this.findById(result.rows[0].id) as Promise<CategoryResponse>;
    }

    async update(id: string, data: UpdateCategoryDTO): Promise<CategoryResponse | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(data.name);
        }
        if (data.description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(data.description);
        }
        if (data.is_active !== undefined) {
            updates.push(`is_active = $${paramIndex++}`);
            values.push(data.is_active);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const query = `
            UPDATE categories 
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING id
        `;

        const result = await pool.query(query, values);
        if (result.rows.length === 0) return null;

        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        // Soft delete is not implemented for categories - hard delete
        // First check if category has documents
        const checkQuery = `SELECT COUNT(*) as count FROM documents WHERE category_id = $1 AND deleted_at IS NULL`;
        const checkResult = await pool.query(checkQuery, [id]);
        
        if (parseInt(checkResult.rows[0].count) > 0) {
            return false; // Cannot delete category with active documents
        }
        
        const query = `DELETE FROM categories WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [id]);
        return result.rows.length > 0;
    }

    async toggleActive(id: string, is_active: boolean): Promise<CategoryResponse | null> {
        const query = `
            UPDATE categories 
            SET is_active = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id
        `;
        const result = await pool.query(query, [is_active, id]);
        if (result.rows.length === 0) return null;

        return this.findById(id);
    }

    async getAllActive(): Promise<CategoryResponse[]> {
        const query = `
            SELECT id, name, description, is_active, created_at, updated_at
            FROM categories 
            WHERE is_active = true 
            ORDER BY name
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    async getStats(): Promise<{ total: number; active: number; inactive: number }> {
        const query = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE is_active = true) as active,
                COUNT(*) FILTER (WHERE is_active = false) as inactive
            FROM categories
        `;
        const result = await pool.query(query);
        return {
            total: parseInt(result.rows[0].total),
            active: parseInt(result.rows[0].active),
            inactive: parseInt(result.rows[0].inactive)
        };
    }
}

export const categoryRepository = new CategoryRepository();
