import { create } from 'zustand';
import type { Produto } from '@/features/inventory';

export interface CartItem extends Produto {
    quantidadeCarrinho: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Produto, quantidade?: number) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getCount: () => number;
}

const sanitizeQuantity = (quantidade: number, unidadeMedida: string): number => {
    const safeQuantity = Math.max(0, quantidade);

    const allowsFractions = unidadeMedida === 'KG';

    return allowsFractions
        ? Number(safeQuantity.toFixed(3))
        : Math.floor(safeQuantity);
};

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addItem: (product, quantidade = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        const validQuantity = sanitizeQuantity(quantidade, product.unidadeMedida);
        if (validQuantity <= 0) return;

        if (existingItem) {
            set({
                items: currentItems.map((item) => {
                    if (item.id === product.id) {
                        const novaQuantidade = item.quantidadeCarrinho + validQuantity;
                        return {
                            ...item,
                            quantidadeCarrinho: sanitizeQuantity(novaQuantidade, item.unidadeMedida)
                        };
                    }
                    return item;
                }),
            });
        } else {
            set({ items: [...currentItems, { ...product, quantidadeCarrinho: validQuantity }] });
        }
    },

    removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
    },

    updateQuantity: (productId, quantity) => {
        const validQuantity = sanitizeQuantity(quantity, get().items.find(i => i.id === productId)?.unidadeMedida || 'UN');

        if (validQuantity <= 0) {
            get().removeItem(productId);
            return;
        }

        set({
            items: get().items.map((item) => {
                if (item.id === productId) {
                    return { ...item, quantidadeCarrinho: validQuantity };
                }
                return item;
            }),
        });
    },

    clearCart: () => set({ items: [] }),

    getTotal: () => {
        const rawTotal = get().items.reduce((total, item) => total + (item.precoVenda * item.quantidadeCarrinho), 0);
        return Number(rawTotal.toFixed(2));
    },

    getCount: () => {
        return get().items.reduce((count, item) => count + item.quantidadeCarrinho, 0);
    }
}));