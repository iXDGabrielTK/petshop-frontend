import type {AuthResponse, User} from "@/features/auth/types";
import {oauthApi} from "@/features/auth/hooks/oauth.ts";
import {ENV} from "@/config/env.ts";
import {generateCodeChallenge, generateRandomString} from "@/features/auth/utils/pkce.ts";
import {api} from "@/lib/axios.ts";
import type { ForgotPasswordSchema } from "@/features/auth/utils/schemas";

let refreshPromise: Promise<AuthResponse> | null = null;

async function me(): Promise<User> {
    const { data } = await api.get<User>("/usuarios/me");
    return data;
}

interface ResetPasswordPayload {
    token: string;
    newPassword: string;
}

async function refreshTokenRequest(): Promise<AuthResponse> {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");

        params.append("client_id", ENV.CLIENT_ID);

        const { data } = await oauthApi.post<AuthResponse>(
            "/oauth2/token",
            params,
            { withCredentials: true }
        );

        return data;
    })();

    try {
        return await refreshPromise;
    } catch (error: any) {
        if (error.response?.status === 400) {
        console.debug("Sem sessão ativa para refresh.");
        }
        throw error;
    } finally {
        refreshPromise = null;
    }
}

async function logout(): Promise<void> {
    try {

        await oauthApi.post("/logout", {}, {
            withCredentials: true
        });
    } catch (error) {
        console.warn("Erro ao chamar logout no backend", error);
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

async function forgotPassword(data: ForgotPasswordSchema): Promise<void> {
    await api.post("/usuarios/forgot-password", data);
}

async function resetPassword(data: ResetPasswordPayload): Promise<void> {
    await api.post("/usuarios/reset-password", {
        token: data.token,
        password: data.newPassword
    });
}


export const authService = {
    me,
    logout,
    refreshTokenRequest,
    loginWithRedirect,
    forgotPassword,
    resetPassword
};