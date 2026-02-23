import { useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";
import {
    CreditCard,
    DollarSign,
    Package,
    Activity,
    Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardService, type DashboardStats } from "@/features/dashboard/api/dashboardService";
import {formatGrowth, getGrowthMeta} from "@/features/dashboard/utils/growthFormatter.ts";

export function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);


    useEffect(() => {
        setMounted(true);
        const loadData = async () => {
            try {
                const data = await dashboardService.getStats();
                setStats(data);
            } catch (error) {
                console.error("Erro ao carregar dashboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) return null;

    const growth = getGrowthMeta(stats.revenueGrowth);
    const GrowthIcon = growth.icon;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Visão geral do desempenho da sua loja hoje.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <p className={`text-xs flex items-center mt-1 ${growth.color}`}>
                            <GrowthIcon className={`h-3 w-3 mr-1 ${growth.iconColor}`} />
                            {formatGrowth(stats.revenueGrowth)} em relação ao mês passado
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.salesCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Transações realizadas hoje
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estoque Crítico</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.lowStockCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Produtos abaixo do mínimo
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Atividade</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.activityCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Acessos ao sistema na última hora
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Faturamento Semanal</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="w-full min-w-0">
                            {mounted ? (
                                <ResponsiveContainer width="99%" aspect={2}>
                                <BarChart data={stats.chartData}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `R$${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="#0f172a"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                            ) : (
                                <div className="w-full aspect-2/1 bg-gray-100 rounded animate-pulse" />
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Vendas Recentes</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Você fez {stats.salesCount} vendas hoje.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats.recentSales.map((sale) => (
                                <div key={sale.id} className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border">
                                        <Package className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{sale.productName}</p>
                                        <p className="text-xs text-muted-foreground">{sale.time}</p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        +{sale.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}