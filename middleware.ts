import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isMustReset = session?.user?.mustResetPassword;

  // already logged in — redirect away from login page
  if (isLoggedIn && nextUrl.pathname === "/") {
    if (isMustReset) return NextResponse.redirect(new URL("/reset-password", nextUrl));
    return NextResponse.redirect(new URL("/dashboard", nextUrl));

  }

  // not logged in — redirect to login
  if (!isLoggedIn && nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // logged in but mustResetPassword — only allow reset-password page
  if (isLoggedIn && isMustReset && nextUrl.pathname !== "/reset-password") {
    return NextResponse.redirect(new URL("/reset-password", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/reset-password",
    "/dashboard/:path*",
    "/(admin)/:path*",
    "/(inventory)/:path*",
  ],
};
