import {useAuthStore} from "@/features/auth/store.ts";

let isLoggingOut = false;

export const handleLogout = (reason: unknown) => {
    if (isLoggingOut) {
        return Promise.reject(reason);
    }

    isLoggingOut = true;

    console.error("Sessão expirada:", reason);

    localStorage.removeItem("code_verifier");
    localStorage.removeItem("oauth_state");
    useAuthStore.getState().logout();
    window.location.href = "/login";

    return Promise.reject(reason);
};
