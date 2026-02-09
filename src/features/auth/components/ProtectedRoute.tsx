import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";

export function ProtectedRoute() {
    const { isAuthenticated, isHydrated } = useAuthStore();

    if (!isHydrated) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-gray-500 text-sm">Validando credenciais...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
