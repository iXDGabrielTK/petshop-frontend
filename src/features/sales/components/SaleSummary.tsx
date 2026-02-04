import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/formatters";

interface SaleSummaryProps {
    itemCount: number;
    total: number;
    isFinalizing: boolean;
    onFinalize: () => void;
}

export function SaleSummary({ itemCount, total, isFinalizing, onFinalize }: SaleSummaryProps) {
    return (
        <Card className="flex-1 flex flex-col">
            <CardHeader>
                <CardTitle>Resumo da Venda</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Itens</span>
                    <span>{itemCount} tipo(s)</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-3xl font-bold text-primary">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                </div>

                <div className="pt-8 space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                        <span>Focar Busca</span>
                        <Badge variant="outline">F2</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span>Finalizar</span>
                        <Badge variant="outline">F9</Badge>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pb-6">
                <Button
                    size="lg"
                    className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
                    disabled={itemCount === 0 || isFinalizing}
                    onClick={onFinalize}
                >
                    {isFinalizing ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <>
                            <CreditCard className="h-6 w-6" />
                            Finalizar Venda
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}