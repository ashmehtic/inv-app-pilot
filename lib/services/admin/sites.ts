import { prisma } from "@/lib/db";

async function generateSiteId(): Promise<string> {
  const last = await prisma.site.findFirst({
    orderBy: { siteId: "desc" },
  });

  if (!last) return "SIT_001";

  const suffix = parseInt(last.siteId.replace("SIT_", ""), 10);
  return `SIT_${String(suffix + 1).padStart(3, "0")}`;
}

export async function getAllSites() {
  return prisma.site.findMany({
    orderBy: { siteId: "asc" },
  });
}

export async function createSite(data: {
  siteName: string;
  siteAddress: string;
  activeYN: string;
}): Promise<{ error: string } | { siteId: string }> {
  const trimmedName = data.siteName.trim();

  const existing = await prisma.site.findFirst({
    where: {
      siteName: { equals: trimmedName, mode: "insensitive" },
    },
  });

  if (existing) return { error: "Site already exists" };

  const siteId = await generateSiteId();
  await prisma.site.create({
    data: {
      siteId,
      siteName: trimmedName,
      siteAddress: data.siteAddress.trim(),
      activeYN: data.activeYN,
    },
  });

  return { siteId };
}

export async function updateSite(
  siteId: string,
  data: { siteName: string; siteAddress: string; activeYN: string }
) {
  return prisma.site.update({
    where: { siteId },
    data: {
      siteName: data.siteName.trim(),
      siteAddress: data.siteAddress.trim(),
      activeYN: data.activeYN,
    },
  });
}
