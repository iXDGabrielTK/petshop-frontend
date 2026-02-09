import { api } from "@/lib/axios";
import type {PageResponse} from "@/types/shared";
import type {Movimentacao, Produto, ProdutoFilters, HistoryParams} from "@/features/inventory/types";
import type {AxiosRequestConfig} from "axios";

const BASE_URL = "/produtos";

export const inventoryService = {
    getAll: async (filters?: ProdutoFilters, config?: AxiosRequestConfig) => {
        const params = new URLSearchParams();
        if (filters?.page !== undefined) params.append("page", filters.page.toString());
        if (filters?.size) params.append("size", filters.size.toString());
        if (filters?.busca) params.append("busca", filters.busca);

        const { data } = await api.get<PageResponse<Produto>>(
            `${BASE_URL}?${params.toString()}`,
            config
        );
        return data;
    },

    getHistory: async (params: HistoryParams): Promise<PageResponse<Movimentacao>> => {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.append("page", params.page.toString());
        if (params.size !== undefined) query.append("size", params.size.toString());
        if (params.startDate) query.append("startDate", params.startDate);
        if (params.endDate) query.append("endDate", params.endDate);

        const response = await api.get<PageResponse<Movimentacao>>(`/movimentacoes?${query.toString()}`);
        return response.data;
    },

    getById: async (id: number) => {
        const { data } = await api.get<Produto>(`${BASE_URL}/${id}`);
        return data;
    },

    create: async (payload: Omit<Produto, 'id'>) => {
        const { data } = await api.post<Produto>(BASE_URL, payload);
        return data;
    },

    update: async (id: number, payload: Partial<Produto>) => {
        const { data } = await api.put<Produto>(`${BASE_URL}/${id}`, payload);
        return data;
    },

    delete: async (id: number) => {
        await api.delete(`${BASE_URL}/${id}`);
    },
};