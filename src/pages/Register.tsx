import { Link } from "react-router-dom";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export function RegisterPage() {
    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Crie sua conta
                </h1>
                <p className="text-sm text-muted-foreground">
                    Preencha os dados abaixo para começar a usar o sistema
                </p>
            </div>

            <RegisterForm />

            <p className="px-8 text-center text-sm text-muted-foreground">
                Já possui uma conta?{" "}
                <Link
                    to="/login"
                    className="underline underline-offset-4 hover:text-primary font-medium text-primary"
                >
                    Fazer Login
                </Link>
            </p>
        </>
    );
}