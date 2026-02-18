export const searchUtils = {
    isNumeric: (term: string) => /^\d+$/.test(term),

    isBarcode: (term: string) => /^\d{8,14}$/.test(term),

    isTooShort: (term: string) => searchUtils.isNumeric(term) && term.length < 2
};

export const SEARCH_DELAYS = {
    BARCODE: 0,
    NUMERIC: 1000,
    TEXT: 800
};