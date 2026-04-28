import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.mustResetPassword = (user as { mustResetPassword: boolean }).mustResetPassword;
      return token;
    },
    async session({ session, token }) {
      session.user.mustResetPassword = token.mustResetPassword as boolean;
      return session;
    },
  },
};
