import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Toaster } from "@/components/ui/sonner";
import {DashboardPage} from "@/features/dashboard/pages/DashboardPage.tsx";
import {useSilentRefresh} from "@/features/auth/hooks/useSilentRefresh.ts";
import {ProtectedRoute} from "@/features/auth/components/ProtectedRoute.tsx";
import {DashboardLayout} from "@/layouts/DashboardLayout.tsx";
import {SettingsPage} from "@/features/settings/pages/SettingsPage.tsx";
import {PdvPage} from "@/features/sales/pages/PdvPage.tsx";
import {HistoryPage} from "@/features/inventory/pages/HistoryPage.tsx";
import {ProductFormPage} from "@/features/inventory/pages/ProductFormPage.tsx";
import {ProductListPage} from "@/features/inventory/pages/ProductListPage.tsx";
import {
    LoginPage,
    RegisterPage,
    AuthorizedPage,
    ResetPasswordPage,
    ForgotPasswordPage,
} from "@/features/auth";
import {useThemeEffect} from "@/features/settings/hooks/useThemeEffect.ts";
function AppRoutes() {
    const { isLoading } = useSilentRefresh();

    useThemeEffect();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                Carregando Sistema...
            </div>
        );
    }
    return (
        <>
            <Routes>
                {/* Públicas */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
                    <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
                    <Route path="/authorized" element={<AuthorizedPage />} />
                </Route>

                {/* Protegidas */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />

                        <Route path="inventario">
                            <Route path="produtos" element={<ProductListPage />} />
                            <Route path="produtos/novo" element={<ProductFormPage />} />
                            <Route path="produtos/:id" element={<ProductFormPage />} />
                            <Route path="pdv" element={<PdvPage />} />
                            <Route path="movimentacoes" element={<HistoryPage />} />
                        </Route>

                        <Route path="/configuracoes" element={<SettingsPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster richColors />
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}