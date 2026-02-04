import { create } from 'zustand';
import type { Produto } from '@/features/inventory/types';
import { inventoryService } from '@/features/inventory';
import { AxiosError } from 'axios';

interface ProductState {
    products: Produto[];
    selectedProduct: Produto | null;

    page: number;
    totalPages: number;
    totalElements: number;

    isLoading: boolean;
    error: string | null;

    fetchProducts: (page?: number, busca?: string) => Promise<void>;
    fetchProductById: (id: number) => Promise<void>;
    createProduct: (product: Omit<Produto, 'id'>) => Promise<void>;
    updateProduct: (id: number, product: Partial<Produto>) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    clearSelection: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    selectedProduct: null,
    page: 0,
    totalPages: 0,
    totalElements: 0,
    isLoading: false,
    error: null,

    fetchProducts: async (page = 0, busca = '') => {
        set({ isLoading: true, error: null });
        try {
            const data = await inventoryService.getAll({ page, size: 10, busca });
            set({
                products: data.content,
                totalPages: data.totalPages,
                totalElements: data.totalElements,
                page: data.number,
                isLoading: false
            });
        } catch (error) {
            set({ isLoading: false, error: 'Erro ao buscar produtos' });
        }
    },

    fetchProductById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const product = await inventoryService.getById(id);
            set({ selectedProduct: product, isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: 'Erro ao carregar produto' });
        }
    },

    createProduct: async (newProduct) => {
        set({ isLoading: true, error: null });
        try {
            await inventoryService.create(newProduct);
            await get().fetchProducts(0);
        } catch (error) {
            const _error = error as AxiosError<{ message: string }>;
            set({
                isLoading: false,
                error: _error.response?.data?.message || 'Erro ao criar produto'
            });
            throw error;
        }
    },

    updateProduct: async (id, updateData) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await inventoryService.update(id, updateData);
            set((state) => ({
                products: state.products.map((p) => (p.id === id ? updated : p)),
                selectedProduct: updated,
                isLoading: false
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Erro ao atualizar produto' });
            throw error;
        }
    },

    deleteProduct: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await inventoryService.delete(id);
            set((state) => ({
                products: state.products.filter((p) => p.id !== id),
                totalElements: state.totalElements - 1,
                isLoading: false
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Erro ao excluir produto' });
            throw error;
        }
    },

    clearSelection: () => set({ selectedProduct: null, error: null })
}));