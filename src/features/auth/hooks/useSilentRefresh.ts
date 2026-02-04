import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store";
import { authService } from "@/features/auth/api/authService";

export function useSilentRefresh() {
    const {
        token,
        expiresAt,
        refreshToken,
        setAuth,
        user,
        logout,
        setHydrated
    } = useAuthStore();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!refreshToken) {
            setHydrated();
            setIsLoading(false);
            return;
        }

        const performSilentRefresh = async () => {
            try {
                console.log("🔄 Silent Refresh: Buscando novo Access Token...");
                const data = await authService.refreshTokenRequest(refreshToken);

                if (user) {
                    setAuth(
                        user,
                        data.access_token,
                        data.refresh_token ?? refreshToken,
                        data.expires_in
                    );
                }
            } catch (error) {
                console.error("⛔ Falha no Silent Refresh. Sessão expirada.", error);
                logout();
            } finally {
                setHydrated();
                setIsLoading(false);
            }
        };

        if (!token || !expiresAt) {
            void performSilentRefresh();
            return;
        }

        setHydrated();
        setIsLoading(false);

        const timeLeft = expiresAt - Date.now();
        const BUFFER_TIME = 2 * 60 * 1000;
        const timeoutDuration = timeLeft - BUFFER_TIME;

        let timer: ReturnType<typeof setTimeout>;

        if (timeoutDuration > 0) {
            timer = setTimeout(performSilentRefresh, timeoutDuration);
        } else {
            void performSilentRefresh();
        }

        const onFocus = () => {
            if (document.visibilityState === "visible") {
                const now = Date.now();
                if ((expiresAt - now) < BUFFER_TIME) {
                    void performSilentRefresh();
                }
            }
        };

        window.addEventListener("focus", onFocus);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("focus", onFocus);
        };
    }, [token, expiresAt, refreshToken, setAuth, user, logout, setHydrated]);

    return { isLoading };
}
