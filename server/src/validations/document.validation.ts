import z from 'zod';

const documentStatusEnum = z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION', 'APPROVED', 'REJECTED']);
const documentPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const createDocumentSchema = z.object({
    body: z.object({
        title: z
            .string()
            .min(2, "Title must be at least 2 characters")
            .max(100, "Title must be at most 100 characters"),
        description: z
            .string()
            .max(2000, "Description must be at most 2000 characters")
            .optional(),
        priority: documentPriorityEnum
            .optional()
            .default('MEDIUM'),
        category_id: z
            .string()
            .uuid("Invalid category ID")
            .optional()
            .nullable(),
        department_id: z
            .string()
            .uuid("Invalid department ID")
            .optional()
            .nullable()
    })
});

export const updateDocumentSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid document ID")
    }),
    body: z.object({
        title: z
            .string()
            .min(2, "Title must be at least 2 characters")
            .max(100, "Title must be at most 100 characters")
            .optional(),
        description: z
            .string()
            .max(2000, "Description must be at most 2000 characters")
            .optional(),
        priority: documentPriorityEnum.optional(),
        status: documentStatusEnum.optional(),
        category_id: z
            .string()
            .uuid("Invalid category ID")
            .optional()
            .nullable(),
        department_id: z
            .string()
            .uuid("Invalid department ID")
            .optional()
            .nullable()
    })
});

export const documentIdSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid document ID")
    })
});

export const documentFileIdSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid document ID"),
        fileId: z.string().uuid("Invalid file ID")
    })
});

export const createVersionSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid document ID")
    }),
    body: z.object({
        change_summary: z
            .string()
            .min(5, "Change summary must be at least 5 characters")
            .max(500, "Change summary must be at most 500 characters")
    })
});

export const versionIdSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid document ID"),
        versionId: z.string().uuid("Invalid version ID")
    })
});
