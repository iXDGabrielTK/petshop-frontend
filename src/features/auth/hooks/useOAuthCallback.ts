import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import { oauthApi } from "@/features/auth/hooks/oauth";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import type { AuthResponse, JWTPayload } from "@/features/auth/types";
import {ENV} from "@/config/env.ts";

export type AuthStatus = 'loading' | 'error' | 'success';

export function useOAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [status, setStatus] = useState<AuthStatus>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const processAuth = async () => {
            const code = searchParams.get("code");
            const stateReturned = searchParams.get("state");
            const storedState = localStorage.getItem("oauth_state");
            const verifier = localStorage.getItem("code_verifier");

            if (!code || !stateReturned) {
                navigate("/login");
                return;
            }

            if (stateReturned !== storedState) {
                const msg = "Erro de segurança: Estado inválido.";
                setStatus("error");
                setErrorMessage(msg);
                toast.error(msg);
                return;
            }

            if (!verifier) {
                const msg = "Erro de validação PKCE (Verifier não encontrado).";
                setStatus("error");
                setErrorMessage(msg);
                toast.error(msg);
                return;
            }

            try {
                const clientId = ENV.CLIENT_ID
                const redirectUri = ENV.REDIRECT_URI

                const params = new URLSearchParams({
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: redirectUri,
                    client_id: clientId,
                    code_verifier: verifier
                });

                const { data } = await oauthApi.post<AuthResponse>(
                    "/oauth2/token",
                    params
                );

                const payload = jwtDecode<JWTPayload>(data.access_token);
                console.log("🕵️ Payload do Token:", payload);

                window.history.replaceState({}, document.title, "/authorized");

                setAuth(
                    {
                        id: payload.sub || "1",
                        name: payload.username || payload.name || "Usuário",
                        email: payload.email || payload.sub || "user@system.com",
                        roles: payload.roles ?? ["USER"]
                    },
                    data.access_token,
                    data.refresh_token || "",
                    data.expires_in
                );

                localStorage.removeItem("code_verifier");
                localStorage.removeItem("oauth_state");

                setStatus("success");
                toast.success(`Bem-vindo de volta, ${payload.sub}!`);

                setTimeout(() => navigate("/dashboard"), 1500);

            } catch (error) {
                console.error("Erro na autenticação:", error);
                const msg = "Falha ao processar autenticação com o servidor.";
                setStatus("error");
                setErrorMessage(msg);
                toast.error(msg);
            }
        };

        void processAuth();
    }, [searchParams, navigate, setAuth]);

    return { status, errorMessage };
}