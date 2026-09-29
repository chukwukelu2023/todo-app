import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = ["/login", "/api/auth"];

// First line of defence only: every API route and page re-checks access on the server.
export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const user = req.auth?.user;

  if (!user) {
    if (isPublic) return NextResponse.next();
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login") return NextResponse.redirect(new URL("/", req.nextUrl));

  const adminOnly = pathname.startsWith("/admin") || pathname.startsWith("/api/users");
  if (adminOnly && user.role !== "ADMIN") {
    if (isApi) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
