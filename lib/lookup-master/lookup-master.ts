export const PRODUCT_TYPES = [
  { value: "Consumable", label: "Consumable" },
  { value: "Durable",    label: "Durable" },
] as const;

export type ProductType = typeof PRODUCT_TYPES[number]["value"];

export const PRODUCT_UNITS = [
  { value: "-",       label: "-" },
  { value: "bags",    label: "bags" },
  { value: "bottles", label: "bottles" },
  { value: "boxes",   label: "boxes" },
  { value: "buckets", label: "buckets" },
  { value: "cases",   label: "cases" },
  { value: "packs",   label: "packs" },
  { value: "pairs",   label: "pairs" },
  { value: "rolls",   label: "rolls" },
  { value: "trays",   label: "trays" },
  { value: "tubs",    label: "tubs" },
] as const;

export type ProductUnit = typeof PRODUCT_UNITS[number]["value"];
