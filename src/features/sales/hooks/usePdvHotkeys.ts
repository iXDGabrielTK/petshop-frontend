import { useEffect } from "react";

interface UsePdvHotkeysProps {
    /** Função para focar no input de busca */
    onFocus: () => void;
    /** Função para disparar a finalização da venda */
    onFinalize: () => void;
    /** Indica se uma venda já está sendo processada */
    isFinalizing: boolean;
    /** Indica se há itens no carrinho */
    hasItems: boolean;
}

export function usePdvHotkeys({
                                  onFocus,
                                  onFinalize,
                                  isFinalizing,
                                  hasItems,
                              }: UsePdvHotkeysProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // F2: Atalho para Focar no Input
            if (e.key === "F2") {
                e.preventDefault();
                onFocus();
            }

            // F9: Atalho para Finalizar Venda
            if (e.key === "F9") {
                e.preventDefault();
                if (hasItems && !isFinalizing) {
                    onFinalize();
                }
            }

            // Dica: Aqui você pode adicionar outros atalhos facilmente
            // Ex: ESC para limpar busca, etc.
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onFocus, onFinalize, isFinalizing, hasItems]);
}