import { useEffect, type FormEvent, useCallback } from "react";
import { useCartStore } from "@/features/sales/hooks/useCartStore";
import { CartList } from "../components/CartList";
import { ProductSearchInput } from "../components/ProductSearchInput";
import { SaleSummary } from "../components/SaleSummary";

import { usePdvFocus } from "../hooks/usePdvFocus";
import { usePdvSearch } from "../hooks/usePdvSearch";
import { usePdvSale } from "../hooks/usePdvSale";
import {usePdvHotkeys} from "@/features/sales/hooks/usePdvHotkeys.ts";

export function PdvPage() {
    const { items, addItem, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

    const { inputRef, setFocus } = usePdvFocus();

    const handleProductFound = useCallback((produto: any) => {
        addItem(produto);
    }, [addItem]);

    const {
        searchTerm,
        setSearchTerm,
        debouncedSearchTerm,
        isSearching,
        searchProduct
    } = usePdvSearch({ onProductFound: handleProductFound });

    const {
        isFinalizing,
        finalizeSale
    } = usePdvSale({ items, clearCart });

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

    const handleManualSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            void searchProduct(searchTerm).then(() => {
                if (!isFinalizing) setFocus();
            });
        }
    };

    useEffect(() => {
        if (debouncedSearchTerm) {
            void searchProduct(debouncedSearchTerm).then(() => {
                if (!isFinalizing) setFocus();
            });
        }
    }, [debouncedSearchTerm, searchProduct, isFinalizing, setFocus]);

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
                <ProductSearchInput
                    ref={inputRef}
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onSearch={handleManualSearch}
                    isLoading={isSearching}
                    disabled={isFinalizing}
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