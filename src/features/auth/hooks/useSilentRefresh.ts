import { useEffect } from "react";
import {useAuthStore} from "@/features/auth/store.ts";
import {authService} from "@/features/auth/api/authService.ts";

export function useSilentRefresh() {
    const { token, expiresAt, refreshToken, setAuth, user, isAuthenticated, logout } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated || !refreshToken) return;

        const performSilentRefresh = async () => {
            try {
                console.log("🔄 Silent Refresh: Buscando novo Access Token...");
                const data = await authService.refreshTokenRequest(refreshToken);

                if (user) {
                    setAuth(user, data.access_token, data.refresh_token || refreshToken, data.expires_in);
                }
            } catch (error) {
                console.error("⛔ Falha no Silent Refresh. Sessão expirada.", error);
                logout(); 
                window.location.href = "/login";
            }
        };

        if (!token || !expiresAt) {
            void performSilentRefresh();
            return;
        }

        const timeLeft = expiresAt - Date.now();
        const BUFFER_TIME = 2 * 60 * 1000;
        const timeoutDuration = timeLeft - BUFFER_TIME;

        let timer: ReturnType<typeof setTimeout>;

        if (timeoutDuration > 0) {
            console.log(`⏱️ Próximo refresh agendado para daqui a ${(timeoutDuration/1000).toFixed(0)}s`);
            timer = setTimeout(() => {
                void performSilentRefresh();
            }, timeoutDuration);
        } else {
            void performSilentRefresh();
        }

        const onFocus = () => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                if (expiresAt && (expiresAt - now) < BUFFER_TIME) {
                    void performSilentRefresh();
                }
            }
        };

        window.addEventListener("focus", onFocus);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("focus", onFocus);
        };
    }, [token, expiresAt, refreshToken, setAuth, user, isAuthenticated, logout]);
}