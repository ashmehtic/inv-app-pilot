import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      mustResetPassword: boolean;
    };
  }

  interface User {
    mustResetPassword: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    mustResetPassword: boolean;
  }
}
