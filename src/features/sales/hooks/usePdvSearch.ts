import { useState, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { inventoryService } from "@/features/inventory";
import { useDebounce } from "@/features/sales/hooks/useDebounce";

interface UsePdvSearchProps {
    onProductFound: (produto: any) => void;
}

export function usePdvSearch({ onProductFound }: UsePdvSearchProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const isBarcode = useMemo(() => /^\d{8,14}$/.test(searchTerm), [searchTerm]);

    const debouncedSearchTerm = useDebounce(searchTerm, isBarcode ? 0 : 500);

    const searchProduct = useCallback(async (term: string) => {
        if (!term.trim()) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsSearching(true);

        try {
            const result = await inventoryService.getAll(
                { busca: term, size: 1 },
                { signal: controller.signal }
            );

            if (controller.signal.aborted) return;

            const produto = result.content?.[0];

            if (produto) {
                onProductFound(produto);
                setSearchTerm("");
                toast.success(`${produto.nome} adicionado!`);
            } else {
                if (/^\d+$/.test(term)) {
                    toast.error("Produto não encontrado.");
                }
            }
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') return;
            if (error instanceof AxiosError && error.code === "ERR_CANCELED") return;

            console.error("Erro na busca:", error);
        } finally {
            if (abortControllerRef.current === controller) {
                setIsSearching(false);
                abortControllerRef.current = null;
            }
        }
    }, [onProductFound]);

    return {
        searchTerm,
        setSearchTerm,
        debouncedSearchTerm,
        isSearching,
        searchProduct
    };
}