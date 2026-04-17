import type { Request, Response, NextFunction } from "express";
import { documentService } from "./document.service.js";
import type { DocumentFilters, UploadedFile } from "src/types/document.types.js";

interface AuthenticatedRequest extends Request {
    user?: { id: string; role?: string };
}

class DocumentController {
    
    async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const filters: DocumentFilters = {
                search: req.query.search as string,
                category_id: req.query.category_id as string,
                department_id: req.query.department_id as string,
                status: req.query.status as any,
                priority: req.query.priority as any,
                is_deleted: req.query.is_deleted === 'true',
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 10,
                sortBy: req.query.sortBy as string || 'created_at',
                sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
            };

            const result = await documentService.getAll(filters);
            
            res.status(200).json({
                success: true,
                message: "Documents retrieved successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getMyDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }

            const filters: DocumentFilters = {
                search: req.query.search as string,
                category_id: req.query.category_id as string,
                status: req.query.status as any,
                priority: req.query.priority as any,
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 10,
                sortBy: req.query.sortBy as string || 'created_at',
                sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
            };

            const result = await documentService.getMyDocuments(userId, filters);
            
            res.status(200).json({
                success: true,
                message: "My documents retrieved successfully",
                data: result
            });
            return;
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const document = await documentService.getById(id as string);
            
            res.status(200).json({
                success: true,
                message: "Document retrieved successfully",
                data: document
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }

            const files = req.files as UploadedFile[] | undefined;
            const document = await documentService.create(req.body, userId, files);
            
            res.status(201).json({
                success: true,
                message: "Document created successfully",
                data: document
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }

            const { id } = req.params;
            const document = await documentService.update(id as string, req.body, userId);
            
            res.status(200).json({
                success: true,
                message: "Document updated successfully",
                data: document
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }

            const { id } = req.params;
            const permanent = req.query.permanent === 'true';
            await documentService.delete(id as string, userId, permanent);
            
            res.status(200).json({
                success: true,
                message: permanent ? "Document permanently deleted" : "Document moved to trash"
            });
        } catch (error) {
            next(error);
        }
    }

    async restore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }

            const { id } = req.params;
            const document = await documentService.restore(id as string, userId);
            
            res.status(200).json({
                success: true,
                message: "Document restored successfully",
                data: document
            });
        } catch (error) {
            next(error);
        }
    }

    // File operations
    async uploadFile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }

            const { id } = req.params;
            const file = req.file as UploadedFile | undefined;
            
            if (!file) {
                res.status(400).json({ success: false, message: "No file provided" });
                return;
            }

            const isPrimary = req.body.is_primary === 'true';
            const documentFile = await documentService.uploadFile(id as string, file, userId, isPrimary);
            
            res.status(201).json({
                success: true,
                message: "File uploaded successfully",
                data: documentFile
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteFile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }

            const { id, fileId } = req.params;
            await documentService.deleteFile(id as string, fileId as string, userId);
            
            res.status(200).json({
                success: true,
                message: "File deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    }

    async downloadFile(req: Request, res: Response, next: NextFunction) {
        try {
            const { fileId } = req.params;
            const file = await documentService.getFile(fileId as string);
            
            // Redirect to file URL for download
            res.redirect(file.file_url);
        } catch (error) {
            next(error);
        }
    }

    // Version operations
    async getVersions(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const versions = await documentService.getVersions(id as string);
            
            res.status(200).json({
                success: true,
                message: "Versions retrieved successfully",
                data: versions
            });
        } catch (error) {
            next(error);
        }
    }

    async createVersion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }

            const { id, fileId } = req.params;
            const { change_summary } = req.body;
            const file = req.file as UploadedFile | undefined;

            if (!file) {
                res.status(400).json({ success: false, message: "No file provided" });
                return;
            }

            const version = await documentService.createVersion(id as string, fileId as string, file, change_summary, userId);
            
            res.status(201).json({
                success: true,
                message: "Version created successfully",
                data: version
            });
        } catch (error) {
            next(error);
        }
    }

    async downloadVersion(req: Request, res: Response, next: NextFunction) {
        try {
            const { versionId } = req.params;
            const version = await documentService.getVersion(versionId as string);
            
            res.redirect(version.file_url);
        } catch (error) {
            next(error);
        }
    }

    // Stats
    async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.query.my === 'true' ? req.user?.id : undefined;
            const stats = await documentService.getStats(userId);
            
            res.status(200).json({
                success: true,
                message: "Document stats retrieved successfully",
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

export const documentController = new DocumentController();
