import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginPage } from "@/pages/Login";
import { RegisterPage } from "@/pages/Register";
import { AuthorizedPage } from "@/pages/Authorized";
import { Toaster } from "@/components/ui/sonner";
import {Dashboard} from "@/pages/Dashboard.tsx";
import {useSilentRefresh} from "@/features/auth/hooks/useSilentRefresh.ts";
import {ProtectedRoute} from "@/features/auth/components/ProtectedRoute.tsx";


export default function App() {
    useSilentRefresh();
    return (
        <BrowserRouter>
            <Routes>
                {/* Rotas Públicas (Login/Register) com o visual bonito */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>

                <Route path="/authorized" element={<AuthorizedPage />} />

                {/* Rotas Protegidas (Dashboard, Produtos) */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    {/* <Route path="/produtos" element={<Produtos />} /> */}
                </Route>

                {/* Redirecionar raiz para login ou dashboard */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster richColors />
        </BrowserRouter>
    );
}