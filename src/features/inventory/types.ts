export type UnidadeMedida = 'UN' | 'KG';

export interface Produto {
    id: number;
    codigoBarras: string;
    nome: string;
    unidadeMedida: UnidadeMedida;
    quantidadeEstoque: number;
    precoVenda: number;
}

export interface ProdutoFilters {
    page?: number;
    size?: number;
    busca?: string;
}

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA';

export interface Movimentacao {
    id: number;
    produtoId: number;
    produtoNome: string;
    quantidade: number;
    tipoMovimentacao: TipoMovimentacao;
    motivo: string;
    dataMovimentacao: string;
    usuario?: string;
}

export interface HistoryParams {
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
}