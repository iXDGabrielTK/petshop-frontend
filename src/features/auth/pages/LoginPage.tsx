import { useEffect } from "react";
import { authService } from "@/features/auth/api/authService";

export function LoginPage() {

    useEffect(() => {
        authService.loginWithRedirect();
    }, []);

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-xl font-semibold">Login</h1>

            <button
                onClick={() => authService.loginWithRedirect()}
                className="rounded bg-primary px-4 py-2 text-white"
            >
                Entrar
            </button>
        </div>
    );
}
