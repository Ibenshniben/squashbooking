import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Check if user is banned
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { bannedUntil: true }
      })

      if (dbUser?.bannedUntil && new Date(dbUser.bannedUntil) > new Date()) {
        throw new Error(`Kontoen din er utestengt til ${new Date(dbUser.bannedUntil).toLocaleDateString('no-NO')}`)
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "USER"
        token.id = user.id
        token.bannedUntil = (user as any).bannedUntil
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.bannedUntil = token.bannedUntil as string | null
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  }
}
