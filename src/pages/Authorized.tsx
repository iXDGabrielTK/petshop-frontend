import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { oauthApi } from "@/lib/oauth";
import { useAuthStore } from "@/features/auth/store";
import { toast } from "sonner";
import { Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import type {AuthResponse, JWTPayload} from "@/features/auth/types";
import { jwtDecode } from "jwt-decode";


export function AuthorizedPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
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
                setStatus("error");
                toast.error("Erro de segurança: Estado inválido.");
                return;
            }

            if (!verifier) {
                setStatus("error");
                toast.error("Erro de validação PKCE.");
                return;
            }

            try {
                const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID;
                const redirectUri = `${window.location.origin}/authorized`;

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
                setStatus("error");
                toast.error("Falha ao processar autenticação.");
            }
        };

        void processAuth();
    }, [searchParams, navigate, setAuth]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm text-center">

                {status === 'loading' && (
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <h2 className="text-xl font-semibold text-gray-900">Autenticando...</h2>
                        <p className="text-sm text-gray-500">Estamos validando suas credenciais.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                        <h2 className="text-xl font-semibold text-gray-900">Sucesso!</h2>
                        <p className="text-sm text-gray-500">Redirecionando para o sistema...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center space-y-4">
                        <ShieldAlert className="h-12 w-12 text-red-500" />
                        <h2 className="text-xl font-semibold text-gray-900">Acesso Negado</h2>
                        <p className="text-sm text-gray-500">
                            Não foi possível validar seu acesso. O código pode ter expirado.
                        </p>
                        <button
                            onClick={() => navigate("/login")}
                            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                        >
                            Voltar para Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}