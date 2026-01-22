import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from './types';

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string, refreshToken: string, expiresIn: number) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            isAuthenticated: false,

            setAuth: (user, token, refreshToken, expiresIn) => {
                const expiresAt = Date.now() + (expiresIn * 1000);
                set({ user, token, refreshToken, expiresAt, isAuthenticated: true });
            },
            logout: () =>
                set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),

            partialize: (state) => ({
                user: state.user,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);