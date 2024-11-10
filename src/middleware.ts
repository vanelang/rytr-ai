import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const session = req.nextauth.token;

    // Check for session errors
    if (session?.error === "UserDeleted" || session?.error === "InvalidSession") {
      // Clear the session cookie
      const response = NextResponse.redirect(new URL("/api/auth/signout", req.url));
      response.cookies.delete("next-auth.session-token");
      response.cookies.delete("__Secure-next-auth.session-token");
      return response;
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
  matcher: ["/dashboard/:path*", "/pricing", "/blog/create"],
};
