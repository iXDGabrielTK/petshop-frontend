import { useEffect } from "react";
import { authService } from "@/features/auth/api/authService";

export function LoginPage() {

    useEffect(() => {
        authService.loginWithRedirect();
    }, []);

    return (
        <div className="flex h-screen items-center justify-center">
            Redirecionando para login seguro...
        </div>
    );
}