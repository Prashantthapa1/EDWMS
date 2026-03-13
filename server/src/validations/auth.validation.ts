import z from 'zod';

export const validateId = z.object({
    params: z.object({
        id: z.string().uuid("Invalid ID format")
    })
});

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be longer than 2 characters"),
        email: z.string().email("Invalid email format"),
        // address: z.string().min(1, "Address is required"),
        // phone_number: z.int(),
        newPassword: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                "Password must contain uppercase, lowercase and a number"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }),
}); 

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string()
    })
});