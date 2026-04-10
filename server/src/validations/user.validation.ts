import z from 'zod';

export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email format"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
                "Password must contain uppercase, lowercase and a number"
            ),
        role_id: z.string().uuid("Invalid role ID"),
        dep_id: z.string().uuid("Invalid department ID").optional(),
        address: z.string().optional(),
        phone_number: z.string().max(15, "Phone number too long").optional(),
        is_active: z.boolean().optional()
    })
});

export const updateUserSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid user ID")
    }),
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters").optional(),
        email: z.string().email("Invalid email format").optional(),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
                "Password must contain uppercase, lowercase and a number"
            )
            .optional(),
        role_id: z.string().uuid("Invalid role ID").optional(),
        dep_id: z.string().uuid("Invalid department ID").nullable().optional(),
        address: z.string().optional(),
        phone_number: z.string().max(15, "Phone number too long").optional(),
        is_active: z.boolean().optional(),
        avatar_url: z.string().url("Invalid avatar URL").optional()
    })
});

export const userIdSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid user ID")
    })
});

export const toggleActiveSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid user ID")
    }),
    body: z.object({
        is_active: z.boolean()
    })
});
