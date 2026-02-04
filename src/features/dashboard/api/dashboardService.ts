// Ajuste este import para onde seu arquivo axios.ts realmente está
import { api } from "@/lib/axios";

export interface DashboardStats {
    totalRevenue: number;
    salesCount: number;
    lowStockCount: number;
    recentSales: {
        id: string;
        productName: string;
        amount: number;
        time: string;
    }[];
    chartData: {
        name: string;
        total: number;
    }[];
}

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        const { data } = await api.get<DashboardStats>("/dashboard/stats");
        return data;
    }
};