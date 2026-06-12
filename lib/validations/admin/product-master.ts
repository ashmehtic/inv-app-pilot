import { z } from "zod";

export const createProductSchema = z.object({
  prodCategoryId: z.string().min(1, "Product category is required"),
  productName: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name must be 100 characters or fewer"),
  productType: z.string().min(1, "Product type is required"),
  defaultQuantity: z.coerce
    .number()
    .int("Default quantity must be an integer")
    .min(1, "Default quantity must be at least 1"),
  productUnit: z.string().min(1, "Product unit is required"),
  trackProductYN: z.string(),
  activeYN: z.string(),
});

export const updateProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  productName: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name must be 100 characters or fewer"),
  productType: z.string().min(1, "Product type is required"),
  defaultQuantity: z.coerce
    .number()
    .int("Default quantity must be an integer")
    .min(1, "Default quantity must be at least 1"),
  productUnit: z.string().min(1, "Product unit is required"),
  trackProductYN: z.string(),
  activeYN: z.string(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
