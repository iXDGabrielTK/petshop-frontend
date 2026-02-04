import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowDownLeft, ArrowUpRight, Package, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Movimentacao } from "../types";

interface HistoryListProps {
    movements: Movimentacao[];
    isLoading: boolean;
}

export function HistoryList({ movements, isLoading }: HistoryListProps) {
    if (isLoading && movements.length === 0) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (movements.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Nenhuma movimentação registrada.
            </div>
        );
    }

    const getMovementStyle = (type: string) => {
        if (type === 'ENTRADA') {
            return {
                icon: ArrowUpRight,
                color: "text-emerald-600",
                bg: "bg-emerald-100",
                label: "Entrada"
            };
        }
        return {
            icon: ArrowDownLeft,
            color: "text-red-600",
            bg: "bg-red-100",
            label: "Saída"
        };
    };

    return (
        <div className="space-y-4">
            {movements.map((mov) => {
                const style = getMovementStyle(mov.tipoMovimentacao);
                const Icon = style.icon;

                return (
                    <div
                        key={mov.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${style.bg}`}>
                                <Icon className={`h-5 w-5 ${style.color}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">
                                        {mov.produtoNome || "Produto desconhecido"}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        {style.label}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                    <Package className="h-3 w-3" />
                                    Motivo: {mov.motivo || "Não informado"}
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className={`block font-bold text-lg ${style.color}`}>
                                {mov.tipoMovimentacao === 'ENTRADA' ? '+' : '-'}
                                {mov.quantidade}
                            </span>
                            <p className="text-xs text-gray-400">
                                {format(new Date(mov.dataMovimentacao), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}