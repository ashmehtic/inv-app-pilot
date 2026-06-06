import { z } from "zod";

export const createProductCategorySchema = z.object({
  prodCategory: z
    .string()
    .trim()
    .min(1, "Product category is required")
    .max(25, "Product category must be 25 characters or fewer"),
});

export const updateProductCategorySchema = z.object({
  prodCategoryId: z.string().min(1, "Product category ID is required"),
  activeYN: z.string(),
});

export type CreateProductCategoryInput = z.infer<typeof createProductCategorySchema>;
export type UpdateProductCategoryInput = z.infer<typeof updateProductCategorySchema>;
