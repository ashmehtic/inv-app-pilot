import { prisma } from "@/lib/db";

async function generateProductCategoryId(): Promise<string> {
  const last = await prisma.productCategory.findFirst({
    orderBy: { prodCategoryId: "desc" },
  });

  if (!last) return "PROD_CAT_001";

  const suffix = parseInt(last.prodCategoryId.replace("PROD_CAT_", ""), 10);
  return `PROD_CAT_${String(suffix + 1).padStart(3, "0")}`;
}

export async function getAllProductCategories() {
  return prisma.productCategory.findMany({
    orderBy: { prodCategoryId: "asc" },
  });
}

export async function createProductCategory(data: {
  prodCategory: string;
  activeYN: string;
}): Promise<{ error: string } | { prodCategoryId: string }> {
  const trimmed = data.prodCategory.trim();

  const existing = await prisma.productCategory.findFirst({
    where: {
      prodCategory: { equals: trimmed, mode: "insensitive" },
    },
  });

  if (existing) return { error: "Product category already exists" };

  const prodCategoryId = await generateProductCategoryId();
  await prisma.productCategory.create({
    data: { prodCategoryId, prodCategory: trimmed, activeYN: data.activeYN },
  });

  return { prodCategoryId };
}

export async function updateProductCategoryActiveYN(
  prodCategoryId: string,
  activeYN: string
) {
  return prisma.productCategory.update({
    where: { prodCategoryId },
    data: { activeYN },
  });
}
