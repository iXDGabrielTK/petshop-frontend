export interface ItemVendaRequest {
    produtoId: number;
    quantidade: number;
}

export interface VendaRequest {
    itens: ItemVendaRequest[];
}

export interface ReciboResponse {
    id: string;
    dataVenda: string;
    total: number;
    itens: {
        nomeProduto: string;
        quantidade: number;
        precoUnitario: number;
        subtotal: number;
    }[];
}