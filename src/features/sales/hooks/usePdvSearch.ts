import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { AxiosError } from "axios";
import { inventoryService, type Produto } from "@/features/inventory";
import { useDebounce } from "@/features/sales/hooks/useDebounce";
import { useSearchType } from "./useSearchType";
import { searchUtils, SEARCH_DELAYS, scaleParser } from "../utils/searchHelpers";

export type ExactMatchState =
    | { type: "FOUND"; produto: Produto; quantidadeExtraida?: number }
    | { type: "NOT_FOUND" }
    | null;

export interface UsePdvSearchProps {
    onExactMatch?: (match: ExactMatchState) => void;
}

const MAX_CACHE_SIZE = 100;

export function usePdvSearch({ onExactMatch }: UsePdvSearchProps = {}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<Produto[]>([]);

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

    const setCacheItem = useCallback((key: string, value: Produto[] | Produto) => {
        if (cacheRef.current.size >= MAX_CACHE_SIZE) {
            const firstKey = cacheRef.current.keys().next().value;
            if (firstKey) cacheRef.current.delete(firstKey);
        }
        cacheRef.current.set(key, value);
    }, []);

    const resetSearchState = useCallback(() => {
        setResults([]);
        setIsSearching(false);
        lastSearchRef.current = "";

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    const clearSearch = useCallback(() => {
        setSearchTerm("");
        resetSearchState();
    }, [resetSearchState]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            resetSearchState();
        }
    }, [searchTerm, resetSearchState]);

    const searchProduct = useCallback(async (term: string) => {
        const termClean = term.trim();

        if (!termClean || searchUtils.isTooShort(termClean)) return;
        if (lastSearchRef.current === termClean) return;

        let queryTerm = termClean;
        let extractedQuantity: number | undefined = undefined;

        const parsedScale = scaleParser.parse(termClean);

        if (parsedScale) {
            queryTerm = parsedScale.productCode;
            extractedQuantity = parsedScale.quantity;
        }

        const isEanSearch = searchUtils.isBarcode(queryTerm);
        const cacheKey = getCacheKey(queryTerm, isEanSearch);
        const cachedItem = cacheRef.current.get(cacheKey);

        if (cachedItem !== undefined) {
            setIsSearching(false);

            lastSearchRef.current = termClean;

            if (isEanSearch) {
                onExactMatch?.({
                    type: "FOUND",
                    produto: cachedItem as Produto,
                    quantidadeExtraida: extractedQuantity
                });
            } else {
                setResults(cachedItem as Produto[]);
            }
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsSearching(true);

        try {
            if (isEanSearch) {
                const produtoEncontrado = await inventoryService.getByEan(queryTerm, controller.signal)
                    .catch((e) => {
                        if (e instanceof AxiosError && e.response?.status === 404) return null;
                        throw e;
                    });

                if (controller.signal.aborted) return;

                lastSearchRef.current = termClean;

                if (produtoEncontrado) {
                    setCacheItem(cacheKey, produtoEncontrado);
                    onExactMatch?.({
                        type: "FOUND",
                        produto: produtoEncontrado,
                        quantidadeExtraida: extractedQuantity
                    });
                } else {
                    onExactMatch?.({ type: "NOT_FOUND" });
                }
            } else {
                const result = await inventoryService.searchByName(queryTerm, controller.signal);

                if (controller.signal.aborted) return;

                lastSearchRef.current = termClean;

                const produtosEncontrados = result.content || [];
                setResults(produtosEncontrados);
                setCacheItem(cacheKey, produtosEncontrados);
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
    }, [getCacheKey, setCacheItem, onExactMatch]);

    const clearCache = useCallback(() => {
        cacheRef.current.clear();
    }, []);

    return {
        searchTerm,
        setSearchTerm,
        debouncedSearchTerm,
        isSearching,
        results,
        searchProduct,
        clearSearch,
        clearCache
    };
}