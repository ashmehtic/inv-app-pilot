"use server";

import { revalidatePath } from "next/cache";
import { createSiteSchema, updateSiteSchema } from "@/lib/validations/admin/sites";
import { createSite, updateSite } from "@/lib/services/admin/sites";

export async function createSiteAction(formData: FormData) {
  const raw = {
    siteName: formData.get("siteName") as string,
    siteAddress: formData.get("siteAddress") as string,
  };

  const parsed = createSiteSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const activeYN = (formData.get("activeYN") as string) || "Y";
  const result = await createSite({ ...parsed.data, activeYN });

  if ("error" in result) {
    return { success: false, error: result.error };
  }

  revalidatePath("/sites/add");
  return { success: true };
}

export async function updateSiteAction(formData: FormData) {
  const raw = {
    siteId: formData.get("siteId") as string,
    siteName: formData.get("siteName") as string,
    siteAddress: formData.get("siteAddress") as string,
    activeYN: formData.get("activeYN") as string,
  };

  const parsed = updateSiteSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await updateSite(parsed.data.siteId, {
    siteName: parsed.data.siteName,
    siteAddress: parsed.data.siteAddress,
    activeYN: parsed.data.activeYN,
  });

  revalidatePath("/sites/add");
  return { success: true };
}
