import { z } from "zod";

export const forgotPasswordSchema = z.object({
    email: z.string().email("Insira um e-mail válido"),
});

export const resetPasswordSchema = z
    .object({
        password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;