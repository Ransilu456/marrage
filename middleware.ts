import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Already handled by withAuth for most cases
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Allow access to public paths without a token
                if (
                    pathname === "/" ||
                    pathname.startsWith("/auth") ||
                    pathname.startsWith("/api/auth") ||
                    pathname.includes(".") || // static files
                    pathname.startsWith("/_next") // next internals
                ) {
                    return true;
                }

                // Require a token for everything else
                return !!token;
            },
        },
        pages: {
            signIn: "/auth/login",
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
