export interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

export interface JWTPayload {
    sub: string;
    email?: string;
    name?: string;
    username?: string;
    roles?: string[];
    exp: number;
    iss: string;
}