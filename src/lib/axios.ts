import axios from 'axios';
import { useAuthStore } from '../features/auth/store';
import type { AxiosError, AxiosRequestConfig } from "axios";
import {handleLogout} from "@/features/auth/api/handleLogout.ts";
import {authService} from "@/features/auth/api/authService.ts";
import {ENV} from "@/config/env.ts";

export const api = axios.create({
    baseURL: ENV.API_URL,
});

interface FailedQueuePromise {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

interface OAuthErrorResponse {
    error?: string;
    error_description?: string;
}

let isRefreshing = false;
let failedQueue: FailedQueuePromise[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

const isInvalidRefreshToken = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) return false;

    const status = error.response?.status;
    const data = error.response?.data as OAuthErrorResponse;

    return (
        status === 400 ||
        status === 401 ||
        data?.error === "invalid_grant"
    );
};

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        const state = useAuthStore.getState();
        const refreshToken = state.refreshToken;

        if (!refreshToken) {
            return handleLogout(new Error("Sem refresh token"));
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token: string) => {
                        if (originalRequest.headers) {
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        }
                        resolve(api(originalRequest));
                    },
                    reject: (err) => {
                        reject(err);
                    }
                });
            });
        }

        isRefreshing = true;

        try {

            const data = await authService.refreshTokenRequest(refreshToken);


            if (state.user) {
                state.setAuth(
                    state.user,
                    data.access_token,
                    data.refresh_token ?? refreshToken,
                    data.expires_in
                );
            }

            processQueue(null, data.access_token);

            originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${data.access_token}`
            };

            return api(originalRequest);

        } catch (refreshError) {

            if (isInvalidRefreshToken(refreshError)) {
                processQueue(refreshError, null);
                return handleLogout(refreshError);
            }

            processQueue(refreshError, null);
            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);
