import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "./types";

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
    isHydrated: boolean;

    setAuth: (
        user: User,
        token: string,
        refreshToken: string,
        expiresIn: number
    ) => void;

    logout: () => void;
    setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            isHydrated: false,

            setAuth: (user, token, refreshToken, expiresIn) => {
                set({
                    user,
                    token,
                    refreshToken,
                    expiresAt: Date.now() + expiresIn * 1000
                });
            },

            logout: () =>
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    expiresAt: null
                }),

            setHydrated: () => set({ isHydrated: true })
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),

            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                expiresAt: state.expiresAt
            }),

            onRehydrateStorage: () => () => {
                useAuthStore.getState().setHydrated();
            }
        }
    )
);
