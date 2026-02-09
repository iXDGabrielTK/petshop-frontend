import { useAuthStore } from "@/features/auth/store.ts";
import { authService } from "@/features/auth/api/authService";

let isLoggingOut = false;

export const handleLogout = async (reason?: unknown) => {
    if (isLoggingOut) {
        return;
    }

    isLoggingOut = true;

    if (reason) {
        console.error("Logout acionado:", reason);
    }

    try {
        await authService.logout();
    } catch (error) {
        console.warn("Backend logout falhou, forçando limpeza local.");
    } finally {
        localStorage.removeItem("code_verifier");
        localStorage.removeItem("oauth_state");

        useAuthStore.getState().logout();

        isLoggingOut = false;

        window.location.href = "/login";
    }
};