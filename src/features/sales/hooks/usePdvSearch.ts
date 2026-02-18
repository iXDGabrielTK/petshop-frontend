import { useState, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { inventoryService, type Produto } from "@/features/inventory";
import { useDebounce } from "@/features/sales/hooks/useDebounce";
import { useSearchType } from "./useSearchType";
import { searchUtils, SEARCH_DELAYS } from "../utils/searchHelpers";

interface UsePdvSearchProps {
    onProductFound: (produto: Produto) => void;
}

export function usePdvSearch({ onProductFound }: UsePdvSearchProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const lastSearchRef = useRef<string>("");

    const { isBarcode, isNumeric } = useSearchType(searchTerm);

    const debounceDelay = useMemo(() => {
        if (isBarcode) return SEARCH_DELAYS.BARCODE;
        if (isNumeric) return SEARCH_DELAYS.NUMERIC;
        return SEARCH_DELAYS.TEXT;
    }, [isBarcode, isNumeric]);

    const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

    const searchProduct = useCallback(async (term: string) => {
        const termClean = term.trim();

        if (!termClean) return;

        if (searchUtils.isTooShort(termClean)) return;

        if (lastSearchRef.current === termClean) return;

        lastSearchRef.current = termClean;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsSearching(true);

        try {
            const result = await inventoryService.getAll(
                { busca: termClean, size: 1 },
                { signal: controller.signal }
            );

            if (controller.signal.aborted) return;

            const produto = result.content?.[0];

            if (produto) {
                onProductFound(produto);
                setSearchTerm("");
                lastSearchRef.current = "";
                toast.success(`${produto.nome} adicionado!`);
            } else {
                if (searchUtils.isNumeric(termClean) && termClean.length >= 8) {
                    toast.error("Produto não encontrado.");
                }
            }
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') return;
            if (error instanceof AxiosError && error.code === "ERR_CANCELED") return;

            lastSearchRef.current = "";
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