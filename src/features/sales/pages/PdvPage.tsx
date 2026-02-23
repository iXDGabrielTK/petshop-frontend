import { useEffect, useCallback } from "react";
import { useCartStore } from "@/features/sales/hooks/useCartStore";
import { CartList } from "../components/CartList";
import { SaleSummary } from "../components/SaleSummary";
import {toast} from "sonner";
import { usePdvFocus } from "../hooks/usePdvFocus";
import { usePdvSearch } from "../hooks/usePdvSearch";
import { usePdvSale } from "../hooks/usePdvSale";
import {usePdvHotkeys} from "@/features/sales/hooks/usePdvHotkeys.ts";
import type {Produto} from "@/features/inventory";
import { ProductCombobox } from "../components/ProductCombobox";

export function PdvPage() {
    const { items, addItem, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
    const { inputRef, setFocus } = usePdvFocus();

    const {
        searchTerm,
        setSearchTerm,
        debouncedSearchTerm,
        isSearching,
        results,
        exactMatch,
        searchProduct,
        clearSearch
    } = usePdvSearch();

    const { isFinalizing, finalizeSale } = usePdvSale({ items, clearCart });

    const handleFinalizeSaleFlow = useCallback(async () => {
        await finalizeSale();
        setFocus();
    }, [finalizeSale, setFocus]);

    usePdvHotkeys({
        onFocus: setFocus,
        onFinalize: handleFinalizeSaleFlow,
        isFinalizing,
        hasItems: items.length > 0
    });

    useEffect(() => {
        if (!exactMatch) return;

        const product = exactMatch;
        clearSearch();

        addItem(product);
        toast.success(`${product.nome} adicionado!`);

        if (!isFinalizing) setFocus();

    }, [exactMatch, addItem, clearSearch, isFinalizing, setFocus]);

    const handleManualSelect = useCallback((produto: Produto) => {
        clearSearch();
        addItem(produto);
        toast.success(`${produto.nome} adicionado!`);

        if (!isFinalizing) setFocus();
    }, [addItem, clearSearch, isFinalizing, setFocus]);

    useEffect(() => {
        if (!debouncedSearchTerm) return;

        void searchProduct(debouncedSearchTerm);

    }, [debouncedSearchTerm, searchProduct]);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] gap-4 p-4">
            <div className="flex-1 flex flex-col gap-4">
                <CartList
                    items={items}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeItem}
                />
            </div>

            <div className="w-full lg:w-100 flex flex-col gap-4">
                <ProductCombobox
                    ref={inputRef}
                    value={searchTerm}
                    onChange={setSearchTerm}
                    isLoading={isSearching}
                    disabled={isFinalizing}
                    results={results}
                    onSelect={handleManualSelect}
                />

                <SaleSummary
                    itemCount={items.length}
                    total={getTotal()}
                    isFinalizing={isFinalizing}
                    onFinalize={handleFinalizeSaleFlow}
                />
            </div>
        </div>
    );
}