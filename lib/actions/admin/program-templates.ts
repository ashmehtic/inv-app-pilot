"use server";

import { createProgramTemplateSchema } from "@/lib/validations/admin/program-templates";
import {
  createProgramTemplate,
  getActiveProductsByCategory,
} from "@/lib/services/admin/program-templates";

export async function getProductsByCategoryAction(prodCategoryId: string) {
  return getActiveProductsByCategory(prodCategoryId);
}

export async function createProgramTemplateAction(input: {
  progTemplateName: string;
  progNotes: string;
  activeYN: string;
  details: {
    productId: string;
    quantity: number;
    productUnit: string;
    trackProductYN: string;
  }[];
}) {
  const parsed = createProgramTemplateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const { progTemplateId } = await createProgramTemplate(parsed.data);
  return { success: true as const, progTemplateId };
}
