import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import type { CartItem } from "../hooks/useCartStore";
import {useState} from "react";
import {Input} from "@/components/ui/input.tsx";

interface CartListProps {
    items: CartItem[];
    onUpdateQuantity: (id: number, quantity: number) => void;
    onRemoveItem: (id: number) => void;
}

export function CartList({ items, onUpdateQuantity, onRemoveItem }: CartListProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<string>("");

    const formatQuantity = (qtd: number, unidade: string = 'UN') => {
        const isKg = unidade === 'KG';
        const valorFormatado = qtd.toLocaleString('pt-BR', {
            minimumFractionDigits: isKg ? 3 : 0,
            maximumFractionDigits: isKg ? 3 : 0
        });
        return `${valorFormatado} ${unidade}`;
    };

    const handleStep = (item: CartItem, direction: 1 | -1) => {
        const step = item.unidadeMedida === 'KG' ? 0.1 : 1;
        onUpdateQuantity(item.id, item.quantidadeCarrinho + (step * direction));
    };

    const startEdit = (item: CartItem) => {
        setEditingId(item.id);
        setEditValue(item.quantidadeCarrinho.toString());
    };

    const confirmEdit = (item: CartItem) => {
        const parsed = Number(parseFloat(editValue.replace(',', '.')).toFixed(3));
        if (!isNaN(parsed) && parsed > 0) {
            onUpdateQuantity(item.id, parsed);
        } else if (parsed <= 0) {
            onRemoveItem(item.id);
        }
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue("");
    };

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
                            <TableHead className="w-24">Código</TableHead>
                            <TableHead>Produto</TableHead>
                            <TableHead className="text-center w-40">Quantidade</TableHead>
                            <TableHead className="text-right">Preço Un.</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                    O carrinho está vazio. <br />
                                    Bipe um código ou busque por nome.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-mono text-xs">{item.codigoBarras || item.id}</TableCell>
                                    <TableCell className="font-medium">{item.nome}</TableCell>

                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => handleStep(item, -1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>

                                            {editingId === item.id ? (
                                                <Input
                                                    autoFocus
                                                    className="w-20 h-7 text-center font-mono px-1"
                                                    value={editValue}
                                                    onChange={(e) => {
                                                        let val = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                                                        val = val.replace(/(\..*)\./g, '$1');
                                                        setEditValue(val);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') confirmEdit(item);
                                                        if (e.key === 'Escape') cancelEdit();
                                                    }}
                                                    onBlur={() => confirmEdit(item)}
                                                />
                                            ) : (
                                                <span
                                                    className="w-20 text-center font-medium cursor-pointer hover:bg-muted py-1 rounded transition-colors"
                                                    onClick={() => startEdit(item)}
                                                    title="Clique para editar"
                                                >
                                                    {formatQuantity(item.quantidadeCarrinho, item.unidadeMedida)}
                                                </span>
                                            )}

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => handleStep(item, 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right text-muted-foreground">
                                        {formatCurrency(item.precoVenda)}
                                    </TableCell>

                                    <TableCell className="text-right font-bold text-primary">
                                        {formatCurrency(item.precoVenda * item.quantidadeCarrinho)}
                                    </TableCell>

                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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