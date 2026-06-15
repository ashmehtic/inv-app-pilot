import { z } from "zod";

export const programTemplateDetailSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be greater than 0"),
  productUnit: z.string().min(1, "Product unit is required"),
  trackProductYN: z.string(),
});

export const createProgramTemplateSchema = z.object({
  progTemplateName: z
    .string()
    .trim()
    .min(1, "Program Template Title is required")
    .max(100, "Program Template Title must be 100 characters or fewer"),
  progNotes: z
    .string()
    .trim()
    .max(200, "Notes must be 200 characters or fewer"),
  activeYN: z.string(),
  details: z
    .array(programTemplateDetailSchema)
    .min(1, "At least one product must be added to the template"),
});

export type CreateProgramTemplateInput = z.infer<typeof createProgramTemplateSchema>;
