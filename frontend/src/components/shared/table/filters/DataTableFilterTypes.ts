export interface DataTableFilterOption {
    label: string;
    value: string;
}

export type RangeOperator = "gte" | "lte";

export interface BaseFilterConfig {
    id: string;
    label: string;
}

export interface SingleSelectFilterConfig extends BaseFilterConfig {
    type: "single-select";
    options: DataTableFilterOption[];
}

export interface MultiSelectFilterConfig extends BaseFilterConfig {
    type: "multi-select";
    options: DataTableFilterOption[];
}

export interface RangeFilterConfig extends BaseFilterConfig {
    type: "range";
}

export type DataTableFilterConfig =
    | SingleSelectFilterConfig
    | MultiSelectFilterConfig
    | RangeFilterConfig;

export type DataTableRangeValue = Partial<Record<RangeOperator, string>>;

export type DataTableFilterValue = string | string[] | DataTableRangeValue;

export type DataTableFilterValues = Record<
    string,
    DataTableFilterValue | undefined
>;

export const RANGE_OPERATORS: RangeOperator[] = ["gte", "lte"];

export const RANGE_OPERATOR_LABEL: Record<RangeOperator, string> = {
    gte: "Min",
    lte: "Max",
};

export const isRangeValue = (
    value: DataTableFilterValue | undefined,
): value is DataTableRangeValue => {
    return !!value && !Array.isArray(value) && typeof value === "object";
};

export const getFilterActiveCount = (
    filter: DataTableFilterConfig,
    value: DataTableFilterValue | undefined,
): number => {
    if (!value) {
        return 0;
    }

    if (filter.type === "single-select") {
        return typeof value === "string" && value.length > 0 ? 1 : 0;
    }

    if (filter.type === "multi-select") {
        return Array.isArray(value) ? value.length : 0;
    }

    if (isRangeValue(value)) {
        return Object.values(value).filter((item) => item && item.length > 0)
            .length;
    }

    return 0;
};
