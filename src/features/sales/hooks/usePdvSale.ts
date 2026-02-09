import { useState, useCallback } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { salesService } from "../api/salesService";

interface UsePdvSaleProps {
    items: any[];
    clearCart: () => void;
}

export function usePdvSale({ items, clearCart }: UsePdvSaleProps) {
    const [isFinalizing, setIsFinalizing] = useState(false);

    const finalizeSale = useCallback(async () => {
        if (items.length === 0) return;

        setIsFinalizing(true);
        try {
            const itensValidos = items.filter(i => i.quantidadeCarrinho > 0);
            if (itensValidos.length === 0) {
                toast.warning("Carrinho vazio ou itens inválidos.");
                return;
            }

            const payload = {
                itens: itensValidos.map(item => ({
                    produtoId: item.id,
                    quantidade: item.quantidadeCarrinho
                }))
            };

            const recibo = await salesService.createSale(payload);

            toast.success(`Venda realizada! Total: R$ ${recibo.total.toFixed(2)}`);
            clearCart();
        } catch (error: unknown) {
            console.error(error);
            let errorMessage = "Erro ao finalizar venda.";

            if (error instanceof AxiosError && error.response?.data) {
                const backendMsg = error.response.data.message || error.response.data.detail;
                if (backendMsg) errorMessage = backendMsg;
            }

            toast.error(errorMessage);
        } finally {
            setIsFinalizing(false);
        }
    }, [items, clearCart]);

    return {
        isFinalizing,
        finalizeSale
    };
}