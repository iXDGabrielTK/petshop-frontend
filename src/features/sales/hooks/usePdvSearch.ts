import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { AxiosError } from "axios";
import { inventoryService, type Produto } from "@/features/inventory";
import { useDebounce } from "@/features/sales/hooks/useDebounce";
import { useSearchType } from "./useSearchType";
import { searchUtils, SEARCH_DELAYS } from "../utils/searchHelpers";

export function usePdvSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const [results, setResults] = useState<Produto[]>([]);
    const [exactMatch, setExactMatch] = useState<Produto | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);
    const lastSearchRef = useRef<string>("");

    const cacheRef = useRef<Map<string, Produto[] | Produto>>(new Map());

    const { isBarcode, isNumeric } = useSearchType(searchTerm);

    const debounceDelay = useMemo(() => {
        if (isBarcode) return SEARCH_DELAYS.BARCODE;
        if (isNumeric) return SEARCH_DELAYS.NUMERIC;
        return SEARCH_DELAYS.TEXT;
    }, [isBarcode, isNumeric]);

    const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

    const getCacheKey = useCallback((term: string, isEan: boolean) => {
        return isEan ? `ean:${term}` : `name:${term}`;
    }, []);

    const clearSearch = useCallback(() => {
        setSearchTerm("");
        setResults([]);
        setExactMatch(null);
        lastSearchRef.current = "";

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setResults([]);
            setExactMatch(null);
            lastSearchRef.current = "";

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
        }
    }, [searchTerm]);

    const searchProduct = useCallback(async (term: string) => {
        const termClean = term.trim();

        if (!termClean || searchUtils.isTooShort(termClean)) return;
        if (lastSearchRef.current === termClean) return;

        const isEanSearch = searchUtils.isBarcode(termClean);
        const cacheKey = getCacheKey(termClean, isEanSearch);

        const cachedItem = cacheRef.current.get(cacheKey);
        if (cachedItem) {
            setIsSearching(false);
            if (isEanSearch) {
                setExactMatch(cachedItem as Produto);
            } else {
                setExactMatch(null);
                setResults(cachedItem as Produto[]);
            }
            lastSearchRef.current = termClean;
            return;
        }

        lastSearchRef.current = termClean;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsSearching(true);

        try {
            if (isEanSearch) {
                const produtoEncontrado = await inventoryService.getByEan(termClean, controller.signal)
                    .catch((e) => {
                        if (e instanceof AxiosError && e.response?.status === 404) return null;
                        throw e;
                    });

                if (controller.signal.aborted) return;

                if (produtoEncontrado) {
                    cacheRef.current.set(cacheKey, produtoEncontrado);
                }
            } else {
                const result = await inventoryService.searchByName(termClean, controller.signal);

                if (controller.signal.aborted) return;

                const produtosEncontrados = result.content || [];

                setExactMatch(null);
                setResults(produtosEncontrados);

                cacheRef.current.set(cacheKey, produtosEncontrados);
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
    }, [getCacheKey]);

    const clearCache = useCallback(() => {
        cacheRef.current.clear();
    }, []);

    return {
        searchTerm,
        setSearchTerm,
        debouncedSearchTerm,
        isSearching,
        results,
        exactMatch,
        searchProduct,
        clearSearch,
        clearCache
    };
}