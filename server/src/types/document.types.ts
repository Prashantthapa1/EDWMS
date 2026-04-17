// Document Management Types

export type DocumentStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'REVISION' | 'APPROVED' | 'REJECTED';
export type DocumentPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface DocumentFilters {
    search?: string;
    category_id?: string;
    department_id?: string;
    status?: DocumentStatus;
    priority?: DocumentPriority;
    created_by?: string;
    is_deleted?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CreateDocumentDTO {
    title: string;
    description?: string;
    priority?: DocumentPriority;
    category_id?: string;
    department_id?: string;
}

export interface UpdateDocumentDTO {
    title?: string;
    description?: string;
    priority?: DocumentPriority;
    status?: DocumentStatus;
    category_id?: string;
    department_id?: string;
}

export interface DocumentFileDTO {
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    cloudinary_public_id: string;
    file_extension: string;
    is_primary?: boolean;
}

export interface DocumentResponse {
    id: string;
    title: string;
    description?: string | null;
    priority: DocumentPriority;
    status: DocumentStatus;
    current_version: number;
    created_by: string;
    creator_name?: string;
    department_id?: string | null;
    department_name?: string | null;
    category_id?: string | null;
    category_name?: string | null;
    created_at: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
    files?: DocumentFileResponse[];
}

export interface DocumentFileResponse {
    id: string;
    document_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    cloudinary_public_id: string;
    file_extension: string;
    is_primary: boolean;
    created_by: string;
    created_at: Date;
}

export interface FileVersionResponse {
    id: string;
    document_id: string;
    document_file_id: string;
    file_url: string;
    cloudinary_public_id: string;
    file_size: number;
    version_number: number;
    change_summary: string;
    is_current: boolean;
    created_at: Date;
    updated_at?: Date | null;
}

export interface PaginatedDocumentResponse {
    data: DocumentResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface DocumentStats {
    total: number;
    draft: number;
    submitted: number;
    under_review: number;
    approved: number;
    rejected: number;
}

export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
