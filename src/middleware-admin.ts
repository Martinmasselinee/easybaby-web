import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Paths that don't require authentication
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Check if the path starts with /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If there's no session and the path is not /admin/login, redirect to login
    if (!session) {
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
