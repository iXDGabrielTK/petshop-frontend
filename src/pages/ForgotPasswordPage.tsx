import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export function ForgotPasswordPage() {
    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Recuperar Senha
                </h1>
                <p className="text-sm text-muted-foreground">
                    Digite seu e-mail para receber o link de recuperação
                </p>
            </div>

            <ForgotPasswordForm />

            <div className="px-8 text-center text-sm text-muted-foreground">
                <Link
                    to="/login"
                    className="flex items-center justify-center underline underline-offset-4 hover:text-primary font-medium text-primary"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Login
                </Link>
            </div>
        </>
    );
}