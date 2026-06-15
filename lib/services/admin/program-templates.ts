import { prisma } from "@/lib/db";

async function generateProgTemplateId(): Promise<string> {
  const last = await prisma.programTemplatesMaster.findFirst({
    orderBy: { progTemplateId: "desc" },
  });

  if (!last) return "PROG_TEMP_0001";

  const suffix = parseInt(last.progTemplateId.replace("PROG_TEMP_", ""), 10);
  return `PROG_TEMP_${String(suffix + 1).padStart(4, "0")}`;
}

export async function getActiveProductsByCategory(prodCategoryId: string) {
  return prisma.product.findMany({
    where: { prodCategoryId, activeYN: "Y" },
    include: { productCategory: true },
    orderBy: { productId: "asc" },
  });
}

export async function createProgramTemplate(data: {
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
  const progTemplateId = await generateProgTemplateId();

  await prisma.programTemplatesMaster.create({
    data: {
      progTemplateId,
      progTemplateName: data.progTemplateName.trim(),
      progNotes: data.progNotes.trim(),
      activeYN: data.activeYN,
      details: {
        create: data.details.map((d) => ({
          productId: d.productId,
          quantity: d.quantity,
          productUnit: d.productUnit,
          trackProductYN: d.trackProductYN,
        })),
      },
    },
  });

  return { progTemplateId };
}
