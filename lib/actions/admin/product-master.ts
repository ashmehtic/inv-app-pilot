"use server";

import { revalidatePath } from "next/cache";
import { createProductSchema, updateProductSchema } from "@/lib/validations/admin/product-master";
import { createProduct, updateProduct } from "@/lib/services/admin/product-master";

export async function createProductAction(formData: FormData) {
  const raw = {
    prodCategoryId: formData.get("prodCategoryId") as string,
    productName: formData.get("productName") as string,
    productType: formData.get("productType") as string,
    defaultQuantity: formData.get("defaultQuantity") as string,
    productUnit: formData.get("productUnit") as string,
    trackProductYN: formData.get("trackProductYN") as string,
    activeYN: formData.get("activeYN") as string,
  };

  const parsed = createProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const result = await createProduct(parsed.data);
  if ("error" in result) {
    return { success: false, error: result.error };
  }

  revalidatePath("/product-master/add");
  return { success: true };
}

export async function updateProductAction(formData: FormData) {
  const raw = {
    productId: formData.get("productId") as string,
    productName: formData.get("productName") as string,
    productType: formData.get("productType") as string,
    defaultQuantity: formData.get("defaultQuantity") as string,
    productUnit: formData.get("productUnit") as string,
    trackProductYN: formData.get("trackProductYN") as string,
    activeYN: formData.get("activeYN") as string,
  };

  const parsed = updateProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const result = await updateProduct(parsed.data.productId, {
    productName: parsed.data.productName,
    productType: parsed.data.productType,
    defaultQuantity: parsed.data.defaultQuantity,
    productUnit: parsed.data.productUnit,
    trackProductYN: parsed.data.trackProductYN,
    activeYN: parsed.data.activeYN,
  });
  if ("error" in result) {
    return { success: false, error: result.error };
  }

  revalidatePath("/product-master/add");
  return { success: true };
}
