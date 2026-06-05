import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { mustResetPassword: boolean; roles: string[] };
        token.mustResetPassword = u.mustResetPassword;
        token.roles = u.roles;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.mustResetPassword = token.mustResetPassword as boolean;
      session.user.roles = token.roles as string[];
      return session;
    },
  },
};
