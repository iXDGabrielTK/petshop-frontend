import { useRef, useCallback } from "react";

export function usePdvFocus() {
    const inputRef = useRef<HTMLInputElement>(null);

    const setFocus = useCallback(() => {
        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    }, []);

    return { inputRef, setFocus };
}