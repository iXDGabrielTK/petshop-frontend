import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import type { Produto } from "@/features/inventory";
import * as React from "react";

interface WeighingDialogProps {
    produto: Produto | null;
    isOpen: boolean;
    onConfirm: (quantidade: number) => void;
    onCancel: () => void;
}

const MAX_WEIGHT_ALLOWED = 999.999;

export function WeighingDialog({ produto, isOpen, onConfirm, onCancel }: WeighingDialogProps) {
    const [weightInput, setWeightInput] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    if (!produto) return null;

    const parsedWeight = Number(parseFloat(weightInput || "0").toFixed(3));

    const subtotal = parsedWeight * produto.precoVenda;

    const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');

        val = val.replace(/(\..*)\./g, '$1');

        const parts = val.split('.');

        if (parts[1] && parts[1].length > 3) return;

        const tempValue = parseFloat(val);
        if (tempValue > MAX_WEIGHT_ALLOWED) return;

        setWeightInput(val);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (parsedWeight > 0 && parsedWeight <= MAX_WEIGHT_ALLOWED) {
            onConfirm(parsedWeight);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-xl">Informar Quantidade</DialogTitle>
                </DialogHeader>

                <div className="bg-muted p-3 rounded-md flex justify-between items-center mb-4">
                    <span className="font-medium text-lg">{produto.nome}</span>
                    <span className="text-muted-foreground">
                        {formatCurrency(produto.precoVenda)} / {produto.unidadeMedida}
                    </span>
                </div>

                <form id="weighing-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="weight" className="text-sm font-medium">
                            Quantidade ({produto.unidadeMedida})
                        </label>
                        <div className="relative">
                            <Input
                                id="weight"
                                ref={inputRef}
                                type="text"
                                inputMode="decimal"
                                placeholder="0.000"
                                value={weightInput}
                                onChange={handleWeightChange}
                                className="text-right text-2xl h-14 font-mono pr-14"
                                autoComplete="off"
                            />
                            <div className="absolute right-4 top-4 text-muted-foreground font-medium">
                                {produto.unidadeMedida}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-end border-t pt-4">
                        <span className="text-muted-foreground font-medium">Subtotal</span>
                        <span className="text-3xl font-bold text-primary">
                            {formatCurrency(subtotal)}
                        </span>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancelar (Esc)
                        </Button>
                        <Button
                            type="submit"
                            disabled={parsedWeight <= 0}
                            className="w-full sm:w-auto"
                        >
                            Confirmar (Enter)
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}