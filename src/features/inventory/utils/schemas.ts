import { z } from "zod";

export const productFormSchema = z.object({
        nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
        codigoBarras: z.string().min(1, "Código de Barras é obrigatório"),

        precoVenda: z.string()
            .min(1, "Preço é obrigatório")
            .refine((val) => !isNaN(Number(val.replace(',', '.'))) && Number(val.replace(',', '.')) > 0, {
                message: "Preço deve ser maior que zero",
            }),

        quantidadeEstoque: z.string()
            .min(1, "Estoque é obrigatório")
            .refine((val) => !isNaN(Number(val.replace(',', '.'))) && Number(val.replace(',', '.')) >= 0, {
                message: "Estoque não pode ser negativo",
            }),

        unidadeMedida: z
            .enum(["UN", "KG"])
            .refine((val) => val === "UN" || val === "KG", {
                message: "Selecione a unidade de medida",
            }),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;