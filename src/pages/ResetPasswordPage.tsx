// src/pages/ResetPasswordPage.tsx
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function ResetPasswordPage() {
    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Nova Senha
                </h1>
                <p className="text-sm text-muted-foreground">
                    Crie uma nova senha segura para sua conta
                </p>
            </div>

            <ResetPasswordForm />

            <div className="px-8 text-center text-sm text-muted-foreground">
                <Link
                    to="/login"
                    className="flex items-center justify-center underline underline-offset-4 hover:text-primary font-medium text-primary"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar
                </Link>
            </div>
        </>
    );
}