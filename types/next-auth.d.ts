import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      mustResetPassword: boolean;
      roles: string[];
    };
  }

  interface User {
    mustResetPassword: boolean;
    roles: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    mustResetPassword: boolean;
    roles: string[];
  }
}
