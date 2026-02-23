import * as React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import type { Produto } from "@/features/inventory";

interface ProductComboboxProps {
    value: string;
    onChange: (value: string) => void;
    isLoading: boolean;
    disabled?: boolean;
    results: Produto[];
    onSelect: (produto: Produto) => void;
}

export const ProductCombobox = React.forwardRef<HTMLInputElement, ProductComboboxProps>(
    ({ value, onChange, isLoading, disabled, results, onSelect }, ref) => {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Adicionar Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <Command shouldFilter={false} loop className="overflow-visible bg-transparent">

                        <div className="relative w-full rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">                            <CommandInput
                                ref={ref}
                                value={value}
                                onValueChange={onChange}
                                disabled={disabled}
                                autoFocus
                                placeholder="Código de barras ou nome (F2)"
                                className="w-full border-none pr-5 focus:ring-0"
                            />
                            {isLoading && (
                                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                            )}
                        </div>

                        {results.length === 0 && value.trim() !== "" && !isLoading && (
                            <div className="relative">
                                <CommandList className="absolute top-2 z-50 w-full rounded-md border bg-popover shadow-md p-3 text-sm text-center text-muted-foreground outline-none animate-in fade-in-0 zoom-in-95">
                                    Nenhum produto encontrado.
                                </CommandList>
                            </div>
                        )}

                        {results.length > 0 && (
                            <div className="relative">
                                <CommandList className="absolute top-2 z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 max-h-75 overflow-y-auto">
                                    <CommandGroup>
                                        {results.map((produto) => (
                                            <CommandItem
                                                key={produto.id}
                                                value={produto.nome}
                                                onSelect={() => {
                                                    onSelect(produto);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <div className="flex w-full justify-between items-center">
                                                    <span className="font-medium">{produto.nome}</span>
                                                    {produto.precoVenda && (
                                                        <span className="text-muted-foreground text-sm">
                                                            R$ {produto.precoVenda.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </div>
                        )}
                    </Command>
                </CardContent>
            </Card>
        );
    }
);

ProductCombobox.displayName = "ProductCombobox";