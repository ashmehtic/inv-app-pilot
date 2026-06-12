import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.roles?.includes("SUPER_ADMIN")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: { productId: "asc" },
  });

  const headers = [
    "productId",
    "prodCategoryId",
    "productName",
    "productType",
    "defaultQuantity",
    "productUnit",
    "trackProductYN",
    "activeYN",
  ];

  const rows = products.map((p) =>
    headers.map((h) => String(p[h as keyof typeof p])).join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="product_master.csv"`,
    },
  });
}
