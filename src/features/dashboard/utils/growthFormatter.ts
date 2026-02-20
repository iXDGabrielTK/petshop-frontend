import {ArrowDownRight, ArrowUpRight, Minus} from "lucide-react";

export const formatGrowth = (value: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        signDisplay: "exceptZero"
    }).format(Number(value) || 0) + "%";
};

export const getGrowthMeta = (value: number = 0) => {
    const n = Number(value) || 0;
    if (n > 0) return { color: "text-green-600", iconColor: "text-green-500", icon: ArrowUpRight };
    if (n < 0) return { color: "text-red-600",   iconColor: "text-red-500",   icon: ArrowDownRight };
    return          { color: "text-muted-foreground", iconColor: "text-muted-foreground", icon: Minus };
};