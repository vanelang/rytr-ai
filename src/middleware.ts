import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname;
    const isAuthenticated = !!req.nextauth.token;

    if (path.startsWith("/dashboard")) {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (path === "/" && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        return true;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
