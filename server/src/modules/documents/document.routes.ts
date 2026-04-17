import { Router } from "express";
import { Validate } from "src/middlewares/validation.middleware.js";
import { documentController } from "./document.controller.js";
import { authenticate } from "@auth/auth.middleware.js";
import { uploadSingle, uploadMultiple } from "src/middlewares/upload.middleware.js";
import { 
    createDocumentSchema, 
    updateDocumentSchema, 
    documentIdSchema,
    documentFileIdSchema,
    createVersionSchema,
    versionIdSchema
} from "src/validations/document.validation.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Stats
router.get('/stats', documentController.getStats);

// My documents
router.get('/my', documentController.getMyDocuments);

// Get all documents with filters/pagination
router.get('/', documentController.getAll);

// Get document by ID
router.get('/:id', 
    Validate(documentIdSchema),
    documentController.getById
);

// Create new document (with optional file upload)
router.post('/', 
    uploadMultiple, // Handle multiple file uploads
    Validate(createDocumentSchema),
    documentController.create
);

// Update document
router.put('/:id', 
    Validate(updateDocumentSchema),
    documentController.update
);

// Delete document (soft delete by default, permanent with ?permanent=true)
router.delete('/:id',
    Validate(documentIdSchema),
    documentController.delete
);

// Restore deleted document
router.patch('/:id/restore',
    Validate(documentIdSchema),
    documentController.restore
);

// File operations
// Upload file to document
router.post('/:id/files',
    Validate(documentIdSchema),
    uploadSingle,
    documentController.uploadFile
);

// Delete file from document
router.delete('/:id/files/:fileId',
    Validate(documentFileIdSchema),
    documentController.deleteFile
);

// Download file
router.get('/:id/files/:fileId/download',
    Validate(documentFileIdSchema),
    documentController.downloadFile
);

// Version operations
// Get all versions
router.get('/:id/versions',
    Validate(documentIdSchema),
    documentController.getVersions
);

// Create new version
router.post('/:id/files/:fileId/versions',
    uploadSingle,
    Validate(createVersionSchema),
    documentController.createVersion
);

// Download specific version
router.get('/:id/versions/:versionId/download',
    Validate(versionIdSchema),
    documentController.downloadVersion
);

export default router;
