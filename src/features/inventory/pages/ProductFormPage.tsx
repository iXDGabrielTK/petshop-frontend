import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useProductStore } from "@/features/inventory/hooks/useProductStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {type ProductFormSchema, productFormSchema} from "@/features/inventory/utils/schemas.ts";


export function ProductFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const {
        createProduct,
        updateProduct,
        fetchProductById,
        selectedProduct,
        isLoading,
        clearSelection
    } = useProductStore();

    const form = useForm<ProductFormSchema>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            nome: "",
            codigoBarras: "",
            precoVenda: "",
            quantidadeEstoque: "",
            unidadeMedida: "UN",
        },
    });

    useEffect(() => {
        if (isEditing && id) {
            void fetchProductById(Number(id));
        } else {
            clearSelection();
            form.reset({
                nome: "",
                codigoBarras: "",
                precoVenda: "",
                quantidadeEstoque: "",
                unidadeMedida: "UN"
            });
        }
    }, [id, isEditing, fetchProductById, clearSelection, form]);

    useEffect(() => {
        if (isEditing && selectedProduct) {
            form.reset({
                nome: selectedProduct.nome,
                codigoBarras: selectedProduct.codigoBarras,
                precoVenda: String(selectedProduct.precoVenda),
                quantidadeEstoque: String(selectedProduct.quantidadeEstoque),
                unidadeMedida: selectedProduct.unidadeMedida,
            });
        }
    }, [selectedProduct, isEditing, form]);

    const onSubmit = async (data: ProductFormSchema) => {
        try {
            const payload = {
                ...data,
                precoVenda: Number(data.precoVenda.replace(',', '.')),
                quantidadeEstoque: Number(data.quantidadeEstoque.replace(',', '.'))
            };

            if (isEditing && id) {
                await updateProduct(Number(id), payload);
                toast.success("Produto atualizado com sucesso!");
            } else {
                await createProduct(payload);
                toast.success("Produto cadastrado com sucesso!");
            }

            navigate("/inventory/products");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar produto.");
        }
    };

    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/inventory/products")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">
                    {isEditing ? "Editar Produto" : "Novo Produto"}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações do Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="codigoBarras"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Código de Barras</FormLabel>
                                            <FormControl>
                                                <Input placeholder="EAN / Código" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="nome"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Produto</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Ração Premium" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="precoVenda"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Preço de Venda (R$)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="quantidadeEstoque"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estoque Inicial</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.001"
                                                    placeholder="0"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="unidadeMedida"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unidade de Medida</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="UN">Unidade (UN)</SelectItem>
                                                    <SelectItem value="KG">Quilograma (KG)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isEditing ? "Salvar Alterações" : "Cadastrar Produto"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}