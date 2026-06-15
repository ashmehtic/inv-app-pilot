export const PRODUCT_TYPES = [
  { value: "Consumable", label: "Consumable" },
  { value: "Durable",    label: "Durable" },
] as const;

export type ProductType = typeof PRODUCT_TYPES[number]["value"];

export const PRODUCT_UNITS = [
  { value: "-",          label: "-" },
  { value: "bags",       label: "bags" },
  { value: "bottles",    label: "bottles" },
  { value: "boxes",      label: "boxes" },
  { value: "buckets",    label: "buckets" },
  { value: "cases",      label: "cases" },
  { value: "collections", label: "collections" },
  { value: "containers", label: "containers" },
  { value: "packets",    label: "packets" },
  { value: "packs",      label: "packs" },
  { value: "pads",       label: "pads" },
  { value: "pairs",      label: "pairs" },
  { value: "pieces",     label: "pieces" },
  { value: "reams",      label: "reams" },
  { value: "rolls",      label: "rolls" },
  { value: "sets",       label: "sets" },
  { value: "sheets",     label: "sheets" },
  { value: "stacks",     label: "stacks" },
  { value: "trays",      label: "trays" },
  { value: "tubs",       label: "tubs" },
] as const;

export type ProductUnit = typeof PRODUCT_UNITS[number]["value"];
