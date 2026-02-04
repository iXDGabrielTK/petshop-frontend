import { create } from 'zustand';
import type { Movimentacao } from '@/features/inventory/types';
import { inventoryService } from '@/features/inventory/api/inventoryService';

interface HistoryState {
    movements: Movimentacao[];
    page: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;

    fetchHistory: (page?: number, startDate?: string, endDate?: string) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
    movements: [],
    page: 0,
    totalPages: 0,
    isLoading: false,
    error: null,

    fetchHistory: async (page = 0, startDate, endDate) => {
        set({ isLoading: true, error: null });
        try {
            const data = await inventoryService.getHistory({ page, size: 20, startDate, endDate });
            set({
                movements: data.content,
                page: data.number,
                totalPages: data.totalPages,
                isLoading: false
            });
        } catch (error) {
            set({
                isLoading: false,
                error: 'Não foi possível carregar o histórico de movimentações.'
            });
        }
    },
}));