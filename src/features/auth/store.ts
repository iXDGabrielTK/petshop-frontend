import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from './types';

interface AuthState {
    user: User | null;
    token: string | null;
    expiresAt: number | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    isHydrated: boolean;

    setAuth: (user: User | null, token: string | null, expiresIn: number | null) => void;
    setAuthenticating: (status: boolean) => void;
    logout: () => void;
    setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            expiresAt: null,
            isAuthenticated: false,
            isAuthenticating: false,
            isHydrated: false,

            setAuth: (user, token, expiresIn) => set({
                user,
                token,
                expiresAt: expiresIn ? Date.now() + (expiresIn * 1000) : null,
                isAuthenticated: !!user,
                isAuthenticating: false
            }),

            setAuthenticating: (status) => set({ isAuthenticating: status }),

            logout: () => set({
                user: null,
                token: null,
                expiresAt: null,
                isAuthenticated: false,
                isAuthenticating: false
            }),

            setHydrated: () => set({ isHydrated: true }),
        }),
        {
            name: 'auth-storage',

            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            }
        }
    )
);