import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import { oauthApi } from "@/features/auth/hooks/oauth";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import type { AuthResponse, JWTPayload } from "@/features/auth/types";
import { ENV } from "@/config/env.ts";

export type AuthStatus = 'loading' | 'error' | 'success';

export function useOAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuth, setAuthenticating } = useAuthStore();

    const [status, setStatus] = useState<AuthStatus>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const processAuth = async () => {
            setAuthenticating(true);

            const code = searchParams.get("code");
            const stateReturned = searchParams.get("state");
            const storedState = localStorage.getItem("oauth_state");
            const verifier = localStorage.getItem("code_verifier");

            if (!code || !stateReturned) {
                navigate("/login");
                return;
            }

            if (stateReturned !== storedState) {
                const msg = "Erro de segurança: Estado OAuth inválido (CSRF detectado).";
                setStatus("error");
                setErrorMessage(msg);
                toast.error(msg);
                return;
            }

            if (!verifier) {
                const msg = "Erro de validação: Verificador PKCE perdido. Tente logar novamente.";
                setStatus("error");
                setErrorMessage(msg);
                toast.error(msg);
                return;
            }

            try {
                window.history.replaceState({}, document.title, "/authorized");

                const params = new URLSearchParams({
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: ENV.REDIRECT_URI,
                    client_id: ENV.CLIENT_ID,
                    code_verifier: verifier
                });

                const { data } = await oauthApi.post<AuthResponse>(
                    "/oauth2/token",
                    params
                );

                const payload = jwtDecode<JWTPayload>(data.access_token);
                console.log("🕵️ Login Sucesso. Payload:", payload);

                setAuth(
                    {
                        id: payload.sub || "1",
                        name: payload.username || payload.name || "Usuário",
                        email: payload.email || payload.sub || "user@system.com",
                        roles: payload.roles ?? ["USER"]
                    },
                    data.access_token,
                    data.expires_in
                );

                localStorage.removeItem("code_verifier");
                localStorage.removeItem("oauth_state");

                setStatus("success");
                toast.success(`Bem-vindo, ${payload.name || payload.sub}!`);

                setTimeout(() => navigate("/dashboard", { replace: true }), 1000);

            } catch (error: any) {
                console.error("Erro na autenticação:", error);
                const msg = error.response?.data?.error_description || "Falha ao processar login.";

                setStatus("error");
                setErrorMessage(msg);
                toast.error(msg);


            } finally {
                setAuthenticating(false);
            }
        };

        void processAuth();
    }, [searchParams, navigate, setAuth, setAuthenticating]);

    return { status, errorMessage };
}