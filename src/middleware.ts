import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname === "/";
    const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard");

    if (isDashboardPage && !isAuth) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
