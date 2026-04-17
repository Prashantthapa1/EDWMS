import { documentRepository } from "./document.repository.js";
import { fileUploadService } from "src/services/fileUpload.service.js";
import { ApiError } from "src/errors/ApiError.js";
import { getFileExtension } from "src/middlewares/upload.middleware.js";
import type { 
    DocumentFilters, 
    CreateDocumentDTO, 
    UpdateDocumentDTO, 
    DocumentResponse, 
    DocumentFileResponse,
    FileVersionResponse,
    PaginatedDocumentResponse,
    DocumentStats,
    UploadedFile
} from "src/types/document.types.js";

class DocumentService {
    
    async getAll(filters: DocumentFilters): Promise<PaginatedDocumentResponse> {
        return documentRepository.findAll(filters);
    }

    async getById(id: string): Promise<DocumentResponse> {
        const document = await documentRepository.findById(id);
        if (!document) {
            throw new ApiError("Document not found", 404);
        }
        return document;
    }

    async create(data: CreateDocumentDTO, userId: string, files?: UploadedFile[]): Promise<DocumentResponse> {
        // Create the document first
        const document = await documentRepository.create(data, userId);

        // Upload and attach files if provided
        if (files?.length) {
            for (const [i, file] of files.entries()) {
                // With `noUncheckedIndexedAccess`, indexing can yield `undefined`.
                if (!file) continue;

                const uploadResult = await fileUploadService.uploadBuffer(
                    file.buffer,
                    file.originalname,
                    { folder: 'documents' }
                );

                await documentRepository.addFile(
                    document.id,
                    {
                        file_name: file.originalname,
                        file_type: file.mimetype,
                        file_size: file.size,
                        file_url: uploadResult.secure_url,
                        cloudinary_public_id: uploadResult.public_id,
                        file_extension: getFileExtension(file.originalname),
                        is_primary: i === 0 // First file is primary
                    },
                    userId
                );
            }
        }

        // Return document with files
        return this.getById(document.id);
    }

    async update(id: string, data: UpdateDocumentDTO, userId: string): Promise<DocumentResponse> {
        const existing = await documentRepository.findById(id);
        if (!existing) {
            throw new ApiError("Document not found", 404);
        }

        // Check ownership or admin rights
        if (existing.created_by !== userId) {
            // TODO: Add role-based check for admins/managers
            throw new ApiError("You don't have permission to update this document", 403);
        }

        // Can't update if document is not in DRAFT status
        if (existing.status !== 'DRAFT' && data.status === undefined) {
            throw new ApiError("Can only update documents in DRAFT status", 400);
        }

        const updated = await documentRepository.update(id, data);
        if (!updated) {
            throw new ApiError("Failed to update document", 500);
        }

        return updated;
    }

    async delete(id: string, userId: string, permanent: boolean = false): Promise<void> {
        const existing = await documentRepository.findById(id);
        if (!existing) {
            throw new ApiError("Document not found", 404);
        }

        // Check ownership
        if (existing.created_by !== userId) {
            throw new ApiError("You don't have permission to delete this document", 403);
        }

        if (permanent) {
            // Delete files from storage
            if (existing.files) {
                for (const file of existing.files) {
                    await fileUploadService.deleteFile(file.cloudinary_public_id);
                }
            }
            
            const deleted = await documentRepository.permanentDelete(id);
            if (!deleted) {
                throw new ApiError("Failed to delete document", 500);
            }
        } else {
            const deleted = await documentRepository.softDelete(id);
            if (!deleted) {
                throw new ApiError("Failed to delete document", 500);
            }
        }
    }

    async restore(id: string, _userId: string): Promise<DocumentResponse> {
        const restored = await documentRepository.restore(id);
        if (!restored) {
            throw new ApiError("Document not found or not deleted", 404);
        }
        return restored;
    }

    // File operations
    async uploadFile(documentId: string, file: UploadedFile, userId: string, isPrimary: boolean = false): Promise<DocumentFileResponse> {
        const document = await documentRepository.findById(documentId, false);
        if (!document) {
            throw new ApiError("Document not found", 404);
        }

        // Upload to storage
        const uploadResult = await fileUploadService.uploadBuffer(
            file.buffer,
            file.originalname,
            { folder: 'documents' }
        );

        // Add file record
        const documentFile = await documentRepository.addFile(
            documentId,
            {
                file_name: file.originalname,
                file_type: file.mimetype,
                file_size: file.size,
                file_url: uploadResult.secure_url,
                cloudinary_public_id: uploadResult.public_id,
                file_extension: getFileExtension(file.originalname),
                is_primary: isPrimary
            },
            userId
        );

        return documentFile;
    }

    async deleteFile(documentId: string, fileId: string, _userId: string): Promise<void> {
        const document = await documentRepository.findById(documentId, false);
        if (!document) {
            throw new ApiError("Document not found", 404);
        }

        const file = await documentRepository.getFileById(fileId);
        if (!file || file.document_id !== documentId) {
            throw new ApiError("File not found", 404);
        }

        // Delete from storage
        await fileUploadService.deleteFile(file.cloudinary_public_id);

        // Delete record
        const deleted = await documentRepository.deleteFile(fileId);
        if (!deleted) {
            throw new ApiError("Failed to delete file", 500);
        }
    }

    async getFile(fileId: string): Promise<DocumentFileResponse> {
        const file = await documentRepository.getFileById(fileId);
        if (!file) {
            throw new ApiError("File not found", 404);
        }
        return file;
    }

    // Version operations
    async getVersions(documentId: string): Promise<FileVersionResponse[]> {
        const document = await documentRepository.findById(documentId, false);
        if (!document) {
            throw new ApiError("Document not found", 404);
        }

        return documentRepository.getVersions(documentId);
    }

    async createVersion(
        documentId: string, 
        fileId: string, 
        file: UploadedFile, 
        changeSummary: string, 
        userId: string
    ): Promise<FileVersionResponse> {
        const document = await documentRepository.findById(documentId, false);
        if (!document) {
            throw new ApiError("Document not found", 404);
        }

        const existingFile = await documentRepository.getFileById(fileId);
        if (!existingFile || existingFile.document_id !== documentId) {
            throw new ApiError("File not found", 404);
        }

        // Upload new version
        const uploadResult = await fileUploadService.uploadBuffer(
            file.buffer,
            file.originalname,
            { folder: 'documents/versions' }
        );

        // Create version record
        const version = await documentRepository.createVersion(
            documentId,
            fileId,
            {
                file_url: uploadResult.secure_url,
                cloudinary_public_id: uploadResult.public_id,
                file_size: file.size,
                change_summary: changeSummary
            }
        );

        // Update the main file record with new version URL
        await documentRepository.addFile(
            documentId,
            {
                file_name: file.originalname,
                file_type: file.mimetype,
                file_size: file.size,
                file_url: uploadResult.secure_url,
                cloudinary_public_id: uploadResult.public_id,
                file_extension: getFileExtension(file.originalname),
                is_primary: existingFile.is_primary
            },
            userId
        );

        return version;
    }

    async getVersion(versionId: string): Promise<FileVersionResponse> {
        const version = await documentRepository.getVersionById(versionId);
        if (!version) {
            throw new ApiError("Version not found", 404);
        }
        return version;
    }

    // Stats
    async getStats(userId?: string): Promise<DocumentStats> {
        return documentRepository.getStats(userId);
    }

    async getMyDocuments(userId: string, filters: DocumentFilters): Promise<PaginatedDocumentResponse> {
        return documentRepository.findAll({ ...filters, created_by: userId });
    }
}

export const documentService = new DocumentService();
