import type {ReciboResponse, VendaRequest} from "@/features/sales/types";
import {api} from "@/lib/axios.ts";

export const salesService = {
    createSale: async (payload: VendaRequest) => {
        const { data } = await api.post<ReciboResponse>('/vendas', payload);
        return data;
    },
}