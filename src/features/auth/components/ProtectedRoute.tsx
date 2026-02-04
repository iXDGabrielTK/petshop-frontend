import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";

export function ProtectedRoute() {
    const { token, isHydrated } = useAuthStore();

    if (!isHydrated) {
        return (
            <div className="flex h-screen items-center justify-center">
                Verificando sessão...
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
