import {useEffect, useRef, useState} from "react";
import { useSettingsStore } from "@/features/settings/hooks/useSettingsStore";
import { api } from "@/lib/axios";
import { toast } from "sonner";

export function useSyncSettings() {
    const { theme, setTheme } = useSettingsStore();
    const [lastConfirmedTheme, setLastConfirmedTheme] = useState(theme);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (theme === lastConfirmedTheme) return;
        console.log(`⏳ Agendando salvamento: ${theme}...`);

        const debounceTimer = setTimeout(async () => {
            try {
                await api.patch("/usuarios/settings", {
                    theme: theme.toUpperCase()
                });

                setLastConfirmedTheme(theme);
                console.log("✅ Tema sincronizado com sucesso.");
            } catch (error) {
                console.error("Falha ao sincronizar configurações", error);
                toast.error("Erro ao salvar suas preferências.");

                toast.error("Erro ao salvar preferência. Revertendo...");
                setTheme(lastConfirmedTheme);
            }
        }, 1000);

        return () => clearTimeout(debounceTimer);

    }, [theme, lastConfirmedTheme, setTheme]);
}