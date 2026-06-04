import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/candidate", "/recruiter", "/agency", "/onboarding"];
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  if (!isLoggedIn && PROTECTED_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
  }

  if (isLoggedIn && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
