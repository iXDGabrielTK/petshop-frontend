import { useNavigate } from "react-router-dom";
import { Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useOAuthCallback } from "@/features/auth/hooks/useOAuthCallback";

export function AuthorizedPage() {
    const navigate = useNavigate();
    const { status, errorMessage } = useOAuthCallback();

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
                            {errorMessage || "Não foi possível validar seu acesso."}
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