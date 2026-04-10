import z from 'zod';

export const createCategorySchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name must be at most 50 characters"),
        description: z
            .string()
            .max(500, "Description must be at most 500 characters")
            .optional(),
        is_active: z.boolean().optional()
    })
});

export const updateCategorySchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid category ID")
    }),
    body: z.object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name must be at most 50 characters")
            .optional(),
        description: z
            .string()
            .max(500, "Description must be at most 500 characters")
            .optional(),
        is_active: z.boolean().optional()
    })
});

export const categoryIdSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid category ID")
    })
});
