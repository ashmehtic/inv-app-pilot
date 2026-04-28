import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function resetPassword(email: string, newPassword: string) {
  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.adminAppUsersRegistry.update({
    where: { email },
    data: {
      password: hashed,
      mustResetPassword: false,
      emailVerified: new Date(),
    },
  });
}
