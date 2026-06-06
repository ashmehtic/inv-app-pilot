"use server";

import { revalidatePath } from "next/cache";
import { createProductCategorySchema, updateProductCategorySchema } from "@/lib/validations/admin/prod-category";
import { createProductCategory, updateProductCategoryActiveYN } from "@/lib/services/admin/prod-category";

export async function createProductCategoryAction(formData: FormData) {
  const raw = {
    prodCategory: formData.get("prodCategory") as string,
  };

  const parsed = createProductCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const activeYN = (formData.get("activeYN") as string) || "Y";
  const result = await createProductCategory({ ...parsed.data, activeYN });

  if ("error" in result) {
    return { success: false, error: result.error };
  }

  revalidatePath("/product-category/add");
  return { success: true };
}

export async function updateProductCategoryActiveYNAction(formData: FormData) {
  const raw = {
    prodCategoryId: formData.get("prodCategoryId") as string,
    activeYN: formData.get("activeYN") as string,
  };

  const parsed = updateProductCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await updateProductCategoryActiveYN(parsed.data.prodCategoryId, parsed.data.activeYN);

  revalidatePath("/product-category/add");
  return { success: true };
}
