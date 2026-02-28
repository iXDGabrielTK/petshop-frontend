import {useEffect, useCallback, useState, useRef} from "react";
import { toast } from "sonner";
import { useCartStore } from "@/features/sales/hooks/useCartStore";
import { usePdvFocus } from "../hooks/usePdvFocus";
import { usePdvSale } from "../hooks/usePdvSale";
import { usePdvHotkeys } from "@/features/sales/hooks/usePdvHotkeys.ts";
import { type ExactMatchState, usePdvSearch } from "../hooks/usePdvSearch";
import type { Produto } from "@/features/inventory";

import { CartList } from "../components/CartList";
import { WeighingDialog } from "../components/WeighingDialog";
import { SaleSummary } from "../components/SaleSummary";
import { ProductCombobox } from "../components/ProductCombobox";

export function PdvPage() {
    const { items, addItem, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
    const { inputRef, setFocus } = usePdvFocus();
    const { isFinalizing, finalizeSale } = usePdvSale({ items, clearCart });

    const [productToWeigh, setProductToWeigh] = useState<Produto | null>(null);

    const clearSearchRef = useRef<(() => void) | null>(null);

    const handleAddToCart = useCallback((produto: Produto, quantidade: number = 1) => {
        addItem(produto, quantidade);
        toast.success(`${produto.nome} adicionado!`);
        clearSearchRef.current?.();
        if (!isFinalizing) setFocus();
    }, [addItem, isFinalizing, setFocus]);

    const handleExactMatchFound = useCallback((match: ExactMatchState) => {
        if (!match) return;

        clearSearchRef.current?.();

        if (match.type === "NOT_FOUND") {
            toast.error("Produto não encontrado no sistema.");
            if (!isFinalizing) setFocus(); // Tenta de novo
            return;
        }

        const { produto, quantidadeExtraida } = match;

        if (produto.unidadeMedida === 'KG' && quantidadeExtraida === undefined) {
            setProductToWeigh(produto);
            return;
        }

        const qtdFinal = quantidadeExtraida !== undefined ? quantidadeExtraida : 1;
        handleAddToCart(produto, qtdFinal);

    }, [handleAddToCart, isFinalizing, setFocus]);

    const {
        searchTerm,
        setSearchTerm,
        debouncedSearchTerm,
        isSearching,
        results,
        searchProduct,
        clearSearch
    } = usePdvSearch({ onExactMatch: handleExactMatchFound });

    useEffect(() => {
        clearSearchRef.current = clearSearch;
    }, [clearSearch]);

    const handleFinalizeSaleFlow = useCallback(async () => {
        await finalizeSale();
        setFocus();
    }, [finalizeSale, setFocus]);

    const handleConfirmWeight = (quantidade: number) => {
        if (productToWeigh) {
            handleAddToCart(productToWeigh, quantidade);
            clearSearch();
        }
        setProductToWeigh(null);
    };

    const handleCancelWeight = () => {
        setProductToWeigh(null);
        clearSearch();
        if (!isFinalizing) setFocus();
    };

    const handleManualSelect = useCallback((produto: Produto) => {
        clearSearch();
        if (produto.unidadeMedida === 'KG') {
            setProductToWeigh(produto);
        } else {
            handleAddToCart(produto, 1);
        }
    }, [handleAddToCart, clearSearch]);

    usePdvHotkeys({
        onFocus: setFocus,
        onFinalize: handleFinalizeSaleFlow,
        isFinalizing,
        hasItems: items.length > 0
    });

    useEffect(() => {
        if (!debouncedSearchTerm) return;
        void searchProduct(debouncedSearchTerm);
    }, [debouncedSearchTerm, searchProduct]);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] gap-4 p-4">
            <WeighingDialog
                key={productToWeigh?.id || 'weighing-empty'}
                produto={productToWeigh}
                isOpen={productToWeigh !== null}
                onConfirm={handleConfirmWeight}
                onCancel={handleCancelWeight}
            />

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
                    disabled={isFinalizing || productToWeigh !== null}
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