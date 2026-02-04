import { useState, useRef, useEffect, type FormEvent } from "react";
import { toast } from "sonner";

import { useCartStore } from "../hooks/useCartStore";
import { salesService } from "../api/salesService";
import { inventoryService } from "@/features/inventory";

import { CartList } from "../components/CartList";
import { ProductSearchInput } from "../components/ProductSearchInput";
import { SaleSummary } from "../components/SaleSummary";

export function PdvPage() {
    const { items, addItem, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isSearching && !isFinalizing) {
            searchInputRef.current?.focus();
        }
    }, [items.length, isSearching, isFinalizing]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F2") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === "F9" && items.length > 0) {
                e.preventDefault();
                void handleFinalizeSale();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [items]);

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        try {
            const result = await inventoryService.getAll({ busca: searchTerm, size: 1 });

            if (result.content && result.content.length > 0) {
                const produto = result.content[0];
                addItem(produto);
                setSearchTerm("");
                toast.success(`${produto.nome} adicionado!`);
            } else {
                toast.error("Produto não encontrado.");
            }
        } catch (error) {
            toast.error("Erro ao buscar produto.");
        } finally {
            setIsSearching(false);
            searchInputRef.current?.focus();
        }
    };

    const handleFinalizeSale = async () => {
        if (items.length === 0) return;

        setIsFinalizing(true);
        try {
            const payload = {
                itens: items.map(item => ({
                    produtoId: item.id,
                    quantidade: item.quantidadeCarrinho
                }))
            };

            const recibo = await salesService.createSale(payload);

            toast.success(`Venda realizada! Total: R$ ${recibo.total.toFixed(2)}`);
            clearCart();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao finalizar venda. Verifique o estoque.");
        } finally {
            setIsFinalizing(false);
        }
    };

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
                    ref={searchInputRef}
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onSearch={handleSearch}
                    isLoading={isSearching}
                    disabled={isFinalizing}
                />

                <SaleSummary
                    itemCount={items.length}
                    total={getTotal()}
                    isFinalizing={isFinalizing}
                    onFinalize={() => void handleFinalizeSale()}
                />
            </div>
        </div>
    );
}