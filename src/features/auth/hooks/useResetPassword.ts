import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authService } from "@/features/auth";
import { resetPasswordSchema, type ResetPasswordSchema } from "../utils/schemas";

export function useResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            toast.error("Link de recuperação inválido ou ausente.");
            navigate("/login");
        }
    }, [token, navigate]);

    const form = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    const handleReset = async (values: ResetPasswordSchema) => {
        if (!token) return;

        try {
            await authService.resetPassword({
                token,
                newPassword: values.password,
            });
            toast.success("Senha alterada com sucesso! Faça login.");
            navigate("/login");
        } catch (error) {
            console.error(error);
            toast.error("Não foi possível alterar a senha. O link pode ter expirado.");
        }
    };

    return {
        form,
        onSubmit: form.handleSubmit(handleReset),
        isSubmitting: form.formState.isSubmitting,
    };
}