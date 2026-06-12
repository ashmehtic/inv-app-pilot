import { prisma } from "@/lib/db";

async function generateProductId(): Promise<string> {
  const last = await prisma.product.findFirst({
    orderBy: { productId: "desc" },
  });

  if (!last) return "PROD_0001";

  const suffix = parseInt(last.productId.replace("PROD_", ""), 10);
  return `PROD_${String(suffix + 1).padStart(4, "0")}`;
}

export async function getAllProducts() {
  return prisma.product.findMany({
    orderBy: { productId: "asc" },
    include: { productCategory: true },
  });
}

export async function getActiveProductCategories() {
  return prisma.productCategory.findMany({
    where: { activeYN: "Y" },
    orderBy: { prodCategory: "asc" },
  });
}

export async function createProduct(data: {
  prodCategoryId: string;
  productName: string;
  productType: string;
  defaultQuantity: number;
  productUnit: string;
  trackProductYN: string;
  activeYN: string;
}): Promise<{ error: string } | { productId: string }> {
  const trimmed = data.productName.trim();

  const existing = await prisma.product.findFirst({
    where: {
      productName: { equals: trimmed, mode: "insensitive" },
    },
  });

  if (existing) return { error: "Product name already exists" };

  const productId = await generateProductId();
  await prisma.product.create({
    data: { productId, ...data, productName: trimmed },
  });
  return { productId };
}

export async function updateProduct(
  productId: string,
  data: {
    productName: string;
    productType: string;
    defaultQuantity: number;
    productUnit: string;
    trackProductYN: string;
    activeYN: string;
  }
): Promise<{ error: string } | { productId: string }> {
  const trimmed = data.productName.trim();

  const existing = await prisma.product.findFirst({
    where: {
      productName: { equals: trimmed, mode: "insensitive" },
      productId: { not: productId },
    },
  });

  if (existing) return { error: "Product name already exists" };

  await prisma.product.update({
    where: { productId },
    data: { ...data, productName: trimmed },
  });
  return { productId };
}
