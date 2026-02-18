import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import { useProductStore } from "@/features/inventory";
import { ProductListTable } from "../components/ProductListTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProductListPage() {
    const navigate = useNavigate();
    const { products, fetchProducts, isLoading, page, totalPages, deleteProduct } = useProductStore();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchProducts(0, searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, fetchProducts]);

    const handleDelete = async (id: number) => {
        if (confirm("Tem certeza que deseja excluir este produto?")) {
            await deleteProduct(id);
        }
    };

    return (
        <div className="space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
                <Button onClick={() => navigate("/inventario/produtos/novo")}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Produto
                </Button>
            </div>

            <div className="flex items-center py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <ProductListTable
                products={products}
                isLoading={isLoading}
                onEdit={(id) => navigate(`/inventario/produtos/${id}`)}
                onDelete={handleDelete}
            />

            <div className="flex items-center justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void fetchProducts(page - 1, searchTerm)}
                    disabled={page === 0 || isLoading}
                >
                    Anterior
                </Button>
                <div className="text-sm text-gray-500">
                    Página {page + 1} de {totalPages || 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void fetchProducts(page + 1, searchTerm)}
                    disabled={page >= totalPages - 1 || isLoading}
                >
                    Próxima
                </Button>
            </div>
        </div>
    );
}