
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRepositoryPrisma } from "@/src/infrastructure/db/UserRepositoryPrisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const userRepo = new UserRepositoryPrisma();
                const user = await userRepo.findByEmail(credentials.email);

                if (user && bcrypt.compareSync(credentials.password, user.passwordHash)) {
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role, // Pass role
                    };
                }
                return null;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as any;
            }
            return session;
        }
    }
});

export { handler as GET, handler as POST };
