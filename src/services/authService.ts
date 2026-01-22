import { oauthApi } from "@/lib/oauth";
import type { AuthResponse } from "@/features/auth/types";

let refreshPromise: Promise<AuthResponse> | null = null;

export async function refreshTokenRequest(refreshToken: string): Promise<AuthResponse> {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID;

        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");
        params.append("refresh_token", refreshToken);
        params.append("client_id", clientId);

        const { data } = await oauthApi.post<AuthResponse>(
            "/oauth2/token",
            params
        );

        return data;
    })();

    try {
        return await refreshPromise;
    } finally {
        refreshPromise = null;
    }
}
