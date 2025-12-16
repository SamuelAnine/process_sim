import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    // `withAuth` augments your `Request` with the user's token.
    function middleware(req){
        const urlString = req.url

        if(!req.nextauth.token.id) {
            if (urlString.includes('simulator')) {
                return NextResponse.redirect(new URL('/', req.url))
            }
            // To block a user, delete their details from the database and add an if-statment
        }
    },
    {
        callbacks: {
            authorized: ({ token } ) => token?.id !== undefined
        },
    },
)

export const config = { matcher: ["/admin/:path*"] }