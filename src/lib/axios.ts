import axios from 'axios';
import { useAuthStore } from '@/features/auth';
import type { AxiosError, AxiosRequestConfig } from "axios";
import {handleLogout} from "@/features/auth/api/handleLogout.ts";
import {authService} from "@/features/auth/api/authService.ts";
import {ENV} from "@/config/env.ts";

const MAX_QUEUE_SIZE = 50;

export const api = axios.create({
    baseURL: ENV.API_URL,
    withCredentials: true
});

interface FailedQueuePromise {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

interface OAuthErrorResponse {
    error?: string;
    error_description?: string;
}

let isLoggingOut = false;
let isRefreshing = false;
let failedQueue: FailedQueuePromise[] = [];

const processQueue = (error: unknown, token: string | null = null) => {

    const queue = [...failedQueue];
    failedQueue = [];

    queue.forEach(prom => {
        try {
            if (error) {
                prom.reject(error);
            } else if (token) {
                prom.resolve(token);
            }
        } catch (e) {
            console.error("Queue process error:", e);
        }
    });
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
        const originalRequest = {
            ...error.config,
            headers: {
                ...error.config?.headers
            }
        } as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        const state = useAuthStore.getState();

        if (isRefreshing) {
            return new Promise((resolve, reject) => {

                if (failedQueue.length >= MAX_QUEUE_SIZE) {
                    return reject(new Error("Sessao expirada. Recarregue a pagina.")
                    );
                }

                const timeout = setTimeout(() => {
                    failedQueue = failedQueue.filter(p => p.reject !== reject);
                    reject(new Error("Refresh timeout"));
                }, 15000);

                failedQueue.push({
                    resolve: (token: string) => {
                        clearTimeout(timeout);

                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }

                        api(originalRequest)
                            .then((response) => {
                                resolve(response);
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    },

                    reject: (err) => {
                        clearTimeout(timeout);
                        reject(err);
                    }
                });
            });
        }

        isRefreshing = true;

        try {

            const data = await authService.refreshTokenRequest();

            const tokenType = data.token_type || "Bearer";

            if (state.user) {
                state.setAuth(
                    state.user,
                    data.access_token,
                    data.expires_in
                );
            }

            processQueue(null, data.access_token);

            originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `${tokenType} ${data.access_token}`
            };

            return api(originalRequest);

        } catch (refreshError) {

            if (isInvalidRefreshToken(refreshError)) {
                if (!isLoggingOut) {
                    isLoggingOut = true;
                    processQueue(refreshError, null);
                    return handleLogout(refreshError);
                }

                processQueue(refreshError, null);
                return Promise.reject(refreshError);
            }


            processQueue(refreshError, null);
            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);
