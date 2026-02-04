import { useEffect } from "react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";

import { useHistoryStore } from "../hooks/useHistoryStore";
import { HistoryList } from "../components/HistoryList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HistoryPage() {
    const { movements, fetchHistory, isLoading, page, totalPages, error } = useHistoryStore();

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    useEffect(() => {
        void fetchHistory(0);
    }, [fetchHistory]);

    return (
        <div className="space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Histórico de Movimentações</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarClock className="h-5 w-5" />
                        Últimas Movimentações
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <HistoryList movements={movements} isLoading={isLoading} />
                </CardContent>
            </Card>

            <div className="flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-500">
                    Página {page + 1} de {totalPages || 1}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void fetchHistory(page - 1)}
                        disabled={page === 0 || isLoading}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void fetchHistory(page + 1)}
                        disabled={page >= totalPages - 1 || isLoading}
                    >
                        Próxima
                    </Button>
                </div>
            </div>
        </div>
    );
}