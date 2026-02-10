import { useEffect } from 'react';
import { useSettingsStore } from './useSettingsStore';

export const useThemeEffect = () => {
    const theme = useSettingsStore((state) => state.theme);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const root = document.documentElement;

        const clear = () => {
            root.classList.remove('light', 'dark');
        };

        clear();

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            const applySystem = () => {
                clear();
                root.classList.add(mediaQuery.matches ? 'dark' : 'light');
            };

            applySystem();

            mediaQuery.addEventListener('change', applySystem);

            return () => {
                mediaQuery.removeEventListener('change', applySystem);
            };
        }

        root.classList.add(theme);

    }, [theme]);
};
