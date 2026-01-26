import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/axios";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
    email: z.string().email("Insira um e-mail válido."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function useForgotPassword() {
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const { isSubmitting } = form.formState;

    async function onSubmit(data: ForgotPasswordFormValues) {
        try {
            await api.post("/usuarios/forgot-password", {
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