import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {Theme} from '@/features/auth/types';

interface SettingsState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'system',
            setTheme: (theme) => set({ theme }),
        }),
        { name: 'settings-storage' }
    )
);