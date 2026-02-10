import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authService } from "@/features/auth";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "../utils/schemas";

export function useForgotPassword() {
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const { isSubmitting } = form.formState;

    async function onSubmit(data: ForgotPasswordSchema) {
        try {
            await authService.forgotPassword({
                email: data.email
            });

            toast.success("Link enviado com sucesso!", {
                description: "Verifique sua caixa de entrada (e spam) para redefinir a senha.",
                duration: 5000,
            });

            setIsSuccess(true);

        } catch (error: any) {
            console.error("Erro no forgot password:", error);

            toast.error("Não foi possível enviar o link", {
                description: error.response?.data?.message || "Verifique o e-mail e tente novamente."
            });

        }
    }

    return {
        form,
        onSubmit: form.handleSubmit(onSubmit),
        isSubmitting,
        isSuccess,
    };
}