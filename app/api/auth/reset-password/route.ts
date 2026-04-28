import { auth } from "@/lib/auth";
import { resetPassword } from "@/lib/services/auth";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = resetPasswordSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  await resetPassword(session.user.email, result.data.password);

  return Response.json({ success: true });
}
