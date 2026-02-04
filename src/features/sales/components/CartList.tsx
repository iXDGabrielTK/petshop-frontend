import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import type { CartItem } from "../hooks/useCartStore";

interface CartListProps {
    items: CartItem[];
    onUpdateQuantity: (id: number, quantity: number) => void;
    onRemoveItem: (id: number) => void;
}

export function CartList({ items, onUpdateQuantity, onRemoveItem }: CartListProps) {
    return (
        <Card className="flex-1 flex flex-col overflow-hidden h-full">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Carrinho de Compras
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-25">Código</TableHead>
                            <TableHead>Produto</TableHead>
                            <TableHead className="text-right">Qtd</TableHead>
                            <TableHead className="text-right">Preço</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead className="w-12.5"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                    O carrinho está vazio. <br />
                                    Use a busca para adicionar produtos.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-mono text-xs">{item.codigoBarras}</TableCell>
                                    <TableCell className="font-medium">{item.nome}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => onUpdateQuantity(item.id, item.quantidadeCarrinho - 1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center">{item.quantidadeCarrinho}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => onUpdateQuantity(item.id, item.quantidadeCarrinho + 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.precoVenda)}</TableCell>
                                    <TableCell className="text-right font-bold">
                                        {formatCurrency(item.precoVenda * item.quantidadeCarrinho)}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-700"
                                            onClick={() => onRemoveItem(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}