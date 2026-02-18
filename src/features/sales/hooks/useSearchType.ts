import { useMemo } from "react";
import { searchUtils } from "../utils/searchHelpers";

export function useSearchType(term: string) {
    return useMemo(() => {
        const isNumeric = searchUtils.isNumeric(term);
        const isBarcode = searchUtils.isBarcode(term);

        return {
            isNumeric,
            isBarcode,
            isText: !isNumeric
        };
    }, [term]);
}