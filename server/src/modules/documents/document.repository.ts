import { pool } from "@config/database.config.js";
import type { 
    DocumentFilters, 
    CreateDocumentDTO, 
    UpdateDocumentDTO, 
    DocumentFileDTO,
    DocumentResponse, 
    DocumentFileResponse,
    FileVersionResponse,
    PaginatedDocumentResponse,
    DocumentStats
} from "src/types/document.types.js";

class DocumentRepository {
    
    async findAll(filters: DocumentFilters): Promise<PaginatedDocumentResponse> {
        const {
            search,
            category_id,
            department_id,
            status,
            priority,
            created_by,
            is_deleted = false,
            page = 1,
            limit = 10,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = filters;

        const offset = (page - 1) * limit;
        const conditions: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        // Handle soft delete
        if (is_deleted) {
            conditions.push(`d.deleted_at IS NOT NULL`);
        } else {
            conditions.push(`d.deleted_at IS NULL`);
        }

        if (search) {
            conditions.push(`(d.title ILIKE $${paramIndex} OR d.description ILIKE $${paramIndex})`);
            values.push(`%${search}%`);
            paramIndex++;
        }

        if (category_id) {
            conditions.push(`d.category_id = $${paramIndex}`);
            values.push(category_id);
            paramIndex++;
        }

        if (department_id) {
            conditions.push(`d.department_id = $${paramIndex}`);
            values.push(department_id);
            paramIndex++;
        }

        if (status) {
            conditions.push(`d.status = $${paramIndex}`);
            values.push(status);
            paramIndex++;
        }

        if (priority) {
            conditions.push(`d.priority = $${paramIndex}`);
            values.push(priority);
            paramIndex++;
        }

        if (created_by) {
            conditions.push(`d.created_by = $${paramIndex}`);
            values.push(created_by);
            paramIndex++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        
        // Validate sortBy to prevent SQL injection
        const allowedSortColumns = ['title', 'created_at', 'updated_at', 'status', 'priority'];
        const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM documents d 
            ${whereClause}
        `;
        const countResult = await pool.query(countQuery, values);
        const total = parseInt(countResult.rows[0].total);

        // Get paginated data
        const dataQuery = `
            SELECT 
                d.id, d.title, d.description, d.priority, d.status,
                d.current_version, d.created_by, u.name as creator_name,
                d.department_id, dep.name as department_name,
                d.category_id, c.name as category_name,
                d.created_at, d.updated_at, d.deleted_at
            FROM documents d
            LEFT JOIN users u ON d.created_by = u.id
            LEFT JOIN departments dep ON d.department_id = dep.id
            LEFT JOIN categories c ON d.category_id = c.id
            ${whereClause}
            ORDER BY d.${safeSortBy} ${safeSortOrder}
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

    async findById(id: string, includeFiles: boolean = true): Promise<DocumentResponse | null> {
        const query = `
            SELECT 
                d.id, d.title, d.description, d.priority, d.status,
                d.current_version, d.created_by, u.name as creator_name,
                d.department_id, dep.name as department_name,
                d.category_id, c.name as category_name,
                d.created_at, d.updated_at, d.deleted_at
            FROM documents d
            LEFT JOIN users u ON d.created_by = u.id
            LEFT JOIN departments dep ON d.department_id = dep.id
            LEFT JOIN categories c ON d.category_id = c.id
            WHERE d.id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return null;

        const document = result.rows[0];

        if (includeFiles) {
            document.files = await this.getDocumentFiles(id);
        }

        return document;
    }

    async create(data: CreateDocumentDTO, userId: string): Promise<DocumentResponse> {
        const query = `
            INSERT INTO documents (
                id, title, description, priority, status, 
                current_version, created_by, department_id, category_id, 
                created_at, updated_at
            )
            VALUES (
                gen_random_uuid(), $1, $2, $3, 'DRAFT', 
                1, $4, $5, $6, 
                NOW(), NOW()
            )
            RETURNING id
        `;
        const result = await pool.query(query, [
            data.title,
            data.description || null,
            data.priority || 'MEDIUM',
            userId,
            data.department_id || null,
            data.category_id || null
        ]);

        return this.findById(result.rows[0].id) as Promise<DocumentResponse>;
    }

    async update(id: string, data: UpdateDocumentDTO): Promise<DocumentResponse | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.title !== undefined) {
            updates.push(`title = $${paramIndex++}`);
            values.push(data.title);
        }
        if (data.description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(data.description);
        }
        if (data.priority !== undefined) {
            updates.push(`priority = $${paramIndex++}`);
            values.push(data.priority);
        }
        if (data.status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            values.push(data.status);
        }
        if (data.category_id !== undefined) {
            updates.push(`category_id = $${paramIndex++}`);
            values.push(data.category_id);
        }
        if (data.department_id !== undefined) {
            updates.push(`department_id = $${paramIndex++}`);
            values.push(data.department_id);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const query = `
            UPDATE documents 
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex} AND deleted_at IS NULL
            RETURNING id
        `;

        const result = await pool.query(query, values);
        if (result.rows.length === 0) return null;

        return this.findById(id);
    }

    async softDelete(id: string): Promise<boolean> {
        const query = `
            UPDATE documents 
            SET deleted_at = NOW(), updated_at = NOW()
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING id
        `;
        const result = await pool.query(query, [id]);
        return result.rows.length > 0;
    }

    async restore(id: string): Promise<DocumentResponse | null> {
        const query = `
            UPDATE documents 
            SET deleted_at = NULL, updated_at = NOW()
            WHERE id = $1 AND deleted_at IS NOT NULL
            RETURNING id
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return null;

        return this.findById(id);
    }

    async permanentDelete(id: string): Promise<boolean> {
        // Delete files first
        await pool.query(`DELETE FROM document_files WHERE document_id = $1`, [id]);
        await pool.query(`DELETE FROM file_versions WHERE document_id = $1`, [id]);
        
        const query = `DELETE FROM documents WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [id]);
        return result.rows.length > 0;
    }

    // Document Files methods
    async getDocumentFiles(documentId: string): Promise<DocumentFileResponse[]> {
        const query = `
            SELECT 
                df.id, df.document_id, df.file_name, df.file_type,
                df.file_size, df.file_url, df.cloudinary_public_id,
                df.file_extension, df.is_primary, df.created_by, df.created_at
            FROM document_files df
            WHERE df.document_id = $1
            ORDER BY df.is_primary DESC, df.created_at DESC
        `;
        const result = await pool.query(query, [documentId]);
        return result.rows;
    }

    async getFileById(fileId: string): Promise<DocumentFileResponse | null> {
        const query = `
            SELECT 
                df.id, df.document_id, df.file_name, df.file_type,
                df.file_size, df.file_url, df.cloudinary_public_id,
                df.file_extension, df.is_primary, df.created_by, df.created_at
            FROM document_files df
            WHERE df.id = $1
        `;
        const result = await pool.query(query, [fileId]);
        return result.rows[0] || null;
    }

    async addFile(documentId: string, file: DocumentFileDTO, userId: string): Promise<DocumentFileResponse> {
        // If this is the first file or is_primary, update other files
        if (file.is_primary) {
            await pool.query(
                `UPDATE document_files SET is_primary = false WHERE document_id = $1`,
                [documentId]
            );
        }

        const query = `
            INSERT INTO document_files (
                id, document_id, file_name, file_type, file_size,
                file_url, cloudinary_public_id, file_extension,
                is_primary, created_by, created_at
            )
            VALUES (
                gen_random_uuid(), $1, $2, $3, $4,
                $5, $6, $7, $8, $9, NOW()
            )
            RETURNING *
        `;
        const result = await pool.query(query, [
            documentId,
            file.file_name,
            file.file_type,
            file.file_size,
            file.file_url,
            file.cloudinary_public_id,
            file.file_extension,
            file.is_primary ?? true,
            userId
        ]);

        return result.rows[0];
    }

    async deleteFile(fileId: string): Promise<boolean> {
        const query = `DELETE FROM document_files WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [fileId]);
        return result.rows.length > 0;
    }

    async setPrimaryFile(documentId: string, fileId: string): Promise<boolean> {
        // Reset all files
        await pool.query(
            `UPDATE document_files SET is_primary = false WHERE document_id = $1`,
            [documentId]
        );
        
        // Set new primary
        const query = `
            UPDATE document_files SET is_primary = true 
            WHERE id = $1 AND document_id = $2
            RETURNING id
        `;
        const result = await pool.query(query, [fileId, documentId]);
        return result.rows.length > 0;
    }

    // File Versions methods
    async getVersions(documentId: string): Promise<FileVersionResponse[]> {
        const query = `
            SELECT 
                fv.id, fv.document_id, fv.document_file_id, fv.file_url,
                fv.cloudinary_public_id, fv.file_size, fv.version_number,
                fv.change_summary, fv.is_current, fv.created_at, fv.updated_at
            FROM file_versions fv
            WHERE fv.document_id = $1
            ORDER BY fv.version_number DESC
        `;
        const result = await pool.query(query, [documentId]);
        return result.rows;
    }

    async getVersionById(versionId: string): Promise<FileVersionResponse | null> {
        const query = `SELECT * FROM file_versions WHERE id = $1`;
        const result = await pool.query(query, [versionId]);
        return result.rows[0] || null;
    }

    async createVersion(
        documentId: string, 
        fileId: string, 
        data: { file_url: string; cloudinary_public_id: string; file_size: number; change_summary: string }
    ): Promise<FileVersionResponse> {
        // Get next version number
        const versionQuery = `
            SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
            FROM file_versions WHERE document_id = $1
        `;
        const versionResult = await pool.query(versionQuery, [documentId]);
        const nextVersion = versionResult.rows[0].next_version;

        // Set old versions as not current
        await pool.query(
            `UPDATE file_versions SET is_current = false WHERE document_id = $1`,
            [documentId]
        );

        // Create new version
        const query = `
            INSERT INTO file_versions (
                id, document_id, document_file_id, file_url, 
                cloudinary_public_id, file_size, version_number,
                change_summary, is_current, created_at, updated_at
            )
            VALUES (
                gen_random_uuid(), $1, $2, $3, 
                $4, $5, $6, $7, true, NOW(), NOW()
            )
            RETURNING *
        `;
        const result = await pool.query(query, [
            documentId,
            fileId,
            data.file_url,
            data.cloudinary_public_id,
            data.file_size,
            nextVersion,
            data.change_summary
        ]);

        // Update document current_version
        await pool.query(
            `UPDATE documents SET current_version = $1, updated_at = NOW() WHERE id = $2`,
            [nextVersion, documentId]
        );

        return result.rows[0];
    }

    // Stats
    async getStats(userId?: string): Promise<DocumentStats> {
        let whereClause = 'WHERE deleted_at IS NULL';
        const values: any[] = [];
        
        if (userId) {
            whereClause += ' AND created_by = $1';
            values.push(userId);
        }

        const query = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'DRAFT') as draft,
                COUNT(*) FILTER (WHERE status = 'SUBMITTED') as submitted,
                COUNT(*) FILTER (WHERE status = 'UNDER_REVIEW') as under_review,
                COUNT(*) FILTER (WHERE status = 'APPROVED') as approved,
                COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected
            FROM documents
            ${whereClause}
        `;
        const result = await pool.query(query, values);
        
        return {
            total: parseInt(result.rows[0].total),
            draft: parseInt(result.rows[0].draft),
            submitted: parseInt(result.rows[0].submitted),
            under_review: parseInt(result.rows[0].under_review),
            approved: parseInt(result.rows[0].approved),
            rejected: parseInt(result.rows[0].rejected)
        };
    }
}

export const documentRepository = new DocumentRepository();
