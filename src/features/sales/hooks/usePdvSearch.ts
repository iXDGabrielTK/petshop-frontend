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
            let produtoEncontrado: Produto | null;

            if (searchUtils.isBarcode(termClean)) {
                produtoEncontrado = await inventoryService.getByEan(termClean, controller.signal)
                    .catch((e) => {
                        if (e instanceof AxiosError && e.response?.status === 404) return null;
                        throw e;
                    });
            } else {
                const result = await inventoryService.searchByName(termClean, controller.signal);
                produtoEncontrado = result.content?.[0] || null;
            }

            if (controller.signal.aborted) return;

            if (produtoEncontrado) {
                onProductFound(produtoEncontrado);
                setSearchTerm("");
                lastSearchRef.current = "";
                toast.success(`${produtoEncontrado.nome} adicionado!`);
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