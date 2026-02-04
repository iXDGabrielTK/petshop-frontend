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

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addItem: (product, quantidade = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
            set({
                items: currentItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantidadeCarrinho: item.quantidadeCarrinho + quantidade }
                        : item
                ),
            });
        } else {
            set({ items: [...currentItems, { ...product, quantidadeCarrinho: quantidade }] });
        }
    },

    removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
    },

    updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(productId);
            return;
        }
        set({
            items: get().items.map((item) =>
                item.id === productId ? { ...item, quantidadeCarrinho: quantity } : item
            ),
        });
    },

    clearCart: () => set({ items: [] }),

    getTotal: () => {
        return get().items.reduce((total, item) => total + (item.precoVenda * item.quantidadeCarrinho), 0);
    },

    getCount: () => {
        return get().items.reduce((count, item) => count + item.quantidadeCarrinho, 0);
    }
}));