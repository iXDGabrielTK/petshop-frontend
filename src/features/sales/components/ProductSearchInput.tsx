import { forwardRef } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductSearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (e: React.FormEvent) => void;
    isLoading: boolean;
    disabled?: boolean;
}

export const ProductSearchInput = forwardRef<HTMLInputElement, ProductSearchInputProps>(
    ({ value, onChange, onSearch, isLoading, disabled }, ref) => {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Adicionar Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSearch} className="flex gap-2">
                        <Input
                            ref={ref}
                            placeholder="Código de barras ou nome (F2)"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            disabled={disabled}
                            autoFocus
                        />
                        <Button type="submit" size="icon" disabled={disabled || isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        );
    }
);
ProductSearchInput.displayName = "ProductSearchInput";