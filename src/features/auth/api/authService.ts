import type { AuthResponse } from "@/features/auth/types";
import {oauthApi} from "@/features/auth/hooks/oauth.ts";
import {ENV} from "@/config/env.ts";
import {generateCodeChallenge, generateRandomString} from "@/features/auth/utils/pkce.ts";

let refreshPromise: Promise<AuthResponse> | null = null;

async function refreshTokenRequest(refreshToken: string): Promise<AuthResponse> {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        const clientId = ENV.CLIENT_ID;

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

async function loginWithRedirect(): Promise<void> {
    const state = generateRandomString(32);
    const codeVerifier = generateRandomString(128);

    localStorage.setItem("oauth_state", state);
    localStorage.setItem("code_verifier", codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const params = new URLSearchParams({
        response_type: "code",
        client_id: ENV.CLIENT_ID,
        scope: "openid profile",
        redirect_uri: ENV.REDIRECT_URI,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
    });

    window.location.href = `${ENV.AUTH_URL}/oauth2/authorize?${params.toString()}`;
}

export const authService = {
    refreshTokenRequest,
    loginWithRedirect
};