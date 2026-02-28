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

export const SCALE_CONFIG = {
    PREFIX: "2",
    CODE_START: 1,
    CODE_LENGTH: 5,
    VALUE_START: 6,
    VALUE_LENGTH: 6,
    DECIMALS: 3,
};

export const scaleParser = {
    isScaleBarcode: (term: string) => {
        return term.length === 13 && term.startsWith(SCALE_CONFIG.PREFIX);
    },

    parse: (term: string) => {
        if (!scaleParser.isScaleBarcode(term)) return null;

        const productCodeRaw = term.substring(SCALE_CONFIG.CODE_START, SCALE_CONFIG.CODE_START + SCALE_CONFIG.CODE_LENGTH);
        const valueRaw = term.substring(SCALE_CONFIG.VALUE_START, SCALE_CONFIG.VALUE_START + SCALE_CONFIG.VALUE_LENGTH);

        const productCode = productCodeRaw.replace(/^0+/, '') || "0";

        const quantity = parseInt(valueRaw, 10) / Math.pow(10, SCALE_CONFIG.DECIMALS);

        return { productCode, quantity };
    }
};