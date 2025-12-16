import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt"
import User from "@/models/users";
import Email from "next-auth/providers/email";
import { connectToDB } from "@/utils/database";

export const authHandler = {
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXT_AUTH_SECRET,
    // Configure one more authentication providers
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: "openid email profile"
                }
            },
            profile(profile) {
                // This controls what gets to `user` in signIn() and session()
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    // Add anything else you want
                    emailVerified: profile.email_verified,
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                }
            }
        }),
        // ...add more providers here
        CredentialsProvider({
            name: 'Credentials',
            credentials: {},
            async authorize(credentials, req) {
                try {
                    await connectToDB()

                    const { email, password } = credentials;

                    const user = await User.findOne({ email: email });

                    if (user) {
                        const passwordMatch = await bcrypt.compare(password, user.hashed_password)

                        if (passwordMatch) {
                            console.log('password match')
                            return user
                        }
                        else {
                            console.log('Email and password does match')
                            return null
                        }
                    }
                    else {
                        console.log('User does not exist')
                        console.log(email)
                        return null
                    }
                } catch (error) {
                    console.log('Auth error', error)
                }
            }
        })
    ],
    pages: {
        signIn: '/signin',
    },
    callbacks: {
        async signIn({ account, profile }) {
            console.log('This is account', account)
            console.log('This is profile', profile)

            if (account.provider === "google") {
                return profile.email_verified && profile.email.endsWith(".com")
            }
            return true // Do different verification for other providers thst don't have emai `email_verified`
        },
        jwt: async ({ token, user, account, profile }) => {
            console.log('token:', token)
            console.log('account:', account)
            console.log('user:', user)
            console.log('profile:', profile)

            if (user) {
                token.id = user._id || profile?.sub
                token.name = user.name || profile?.name
                token.email = user.email || profile?.email
                token.picture = user.image || profile?.picture
            }
            return token
        },
        session: async ({ session, token }) => {
            if (token) {
                session.user = {
                    id: token.id,
                    name: token.name,
                    email: token.email,
                    image: token.picture,
                }
            }
            return session
        }
    }
}

const handler = NextAuth(authHandler)

export { handler as GET, handler as POST }