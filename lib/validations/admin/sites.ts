import { z } from "zod";

export const createSiteSchema = z.object({
  siteName: z
    .string()
    .trim()
    .min(1, "Site name is required")
    .max(50, "Site name must be 50 characters or fewer"),
  siteAddress: z
    .string()
    .trim()
    .min(1, "Site address is required")
    .max(255, "Site address must be 255 characters or fewer"),
});

export const updateSiteSchema = z.object({
  siteId: z.string().min(1, "Site ID is required"),
  siteName: z
    .string()
    .trim()
    .min(1, "Site name is required")
    .max(50, "Site name must be 50 characters or fewer"),
  siteAddress: z
    .string()
    .trim()
    .min(1, "Site address is required")
    .max(255, "Site address must be 255 characters or fewer"),
  activeYN: z.string(),
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
