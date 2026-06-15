import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.roles?.includes("SUPER_ADMIN")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const progTemplateId = new URL(request.url).searchParams.get("progTemplateId");
  if (!progTemplateId) {
    return new Response("Missing progTemplateId", { status: 400 });
  }

  const details = await prisma.programTemplatesDetails.findMany({
    where: { progTemplateId },
    orderBy: { productId: "asc" },
  });

  const headers = [
    "progTemplateId",
    "productId",
    "quantity",
    "productUnit",
    "trackProductYN",
  ];

  const rows = details.map((d) =>
    headers.map((h) => String(d[h as keyof typeof d])).join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${progTemplateId}_details.csv"`,
    },
  });
}
