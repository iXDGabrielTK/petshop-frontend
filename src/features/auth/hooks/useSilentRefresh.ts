import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import { authService } from "@/features/auth/api/authService";
import { AxiosError } from "axios";

const REFRESH_BUFFER = 2 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useSilentRefresh() {
    const {
        user,
        expiresAt,
        setAuth,
        setHydrated,
        isAuthenticating,
        logout
    } = useAuthStore();

    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const isRefreshing = useRef(false);

    const performSilentRefresh = useCallback(async () => {
        if (isAuthenticating) return;
        if (location.pathname === "/authorized" || location.pathname === "/login") return;

        if (isRefreshing.current) return;
        if (!navigator.onLine) return;

        isRefreshing.current = true;

        try {
            console.log("🔄 Silent Refresh: Verificando sessão...");

            for (let i = 0; i < MAX_RETRIES; i++) {
                try {
                    if (useAuthStore.getState().isAuthenticating) return;

                    const data = await authService.refreshTokenRequest();
                    const currentUser = user ?? await authService.me();

                    setAuth(currentUser, data.access_token, data.expires_in);

                    break;

                } catch (error) {
                    if (error instanceof AxiosError && (error.response?.status === 400 || error.response?.status === 401)) {
                        throw error;
                    }

                    if (i === MAX_RETRIES - 1) throw error;

                    await wait(RETRY_DELAY * (i + 1));
                }
            }
        } catch (error) {
            if (error instanceof AxiosError && (error.response?.status === 401 || error.response?.status === 400)) {
                if (!useAuthStore.getState().isAuthenticating) {
                    console.debug("Visitante detectado (sem sessão).");
                    logout();
                }
            } else {
                console.error("Erro CRÍTICO no refresh token:", error);
            }
        } finally {
            isRefreshing.current = false;

            if (!useAuthStore.getState().isAuthenticating) {
                setHydrated();
                setIsLoading(false);
            }
        }
    }, [user, setAuth, setHydrated, location.pathname, isAuthenticating, logout]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        let isMounted = true;

        const publicRoutes = ["/login", "/register", "/authorized", "/esqueci-senha", "/redefinir-senha"];
        const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

        if (isPublicRoute) {
            setHydrated();
            setIsLoading(false);
            return;
        }

        const run = async () => {
            if (isMounted) await performSilentRefresh();
        };

        if (isAuthenticating) {
            return;
        }

        if (!expiresAt) {
            if (!isRefreshing.current) void run();
        } else {
            const delay = expiresAt - Date.now() - REFRESH_BUFFER;

            if (delay <= 0) {
                if (!isRefreshing.current) void run();
            } else {
                timer = setTimeout(run, delay);
                setIsLoading(false);
                setHydrated();
            }
        }

        const onFocus = () => {
            if (document.visibilityState === "visible" && isMounted && navigator.onLine) {
                const now = Date.now();
                if (!useAuthStore.getState().isAuthenticating && (!expiresAt || (expiresAt - now < REFRESH_BUFFER))) {
                    void run();
                }
            }
        };

        window.addEventListener("focus", onFocus);
        window.addEventListener("online", onFocus);

        return () => {
            isMounted = false;
            if (timer) clearTimeout(timer);
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("online", onFocus);
        };
    }, [expiresAt, performSilentRefresh, setHydrated, isAuthenticating, location.pathname]);

    return { isLoading };
}