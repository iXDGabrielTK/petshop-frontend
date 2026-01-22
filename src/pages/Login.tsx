import { useEffect } from "react";
import { generateRandomString, generateCodeChallenge } from "@/utils/auth";
import {ENV} from "@/config/env.ts";

export function LoginPage() {

    const handleLogin = async () => {
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
    };

    useEffect(() => {
        handleLogin();
    }, []);

    return <div className="flex h-screen items-center justify-center">Redirecionando para login seguro...</div>;
}