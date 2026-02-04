import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectToDatabase from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await connectToDatabase()

        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase()
        }).select('+password')

        if (!user || !user.password) {
          return null
        }

        const isValid = await user.comparePassword(credentials.password as string)
        if (!isValid) {
          return null
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.displayName,
          image: user.avatar,
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      try {
        await connectToDatabase()

        // Update last login
        await User.findByIdAndUpdate(user.id, { lastLogin: new Date() })

        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub

        try {
          await connectToDatabase()
          const user = await User.findById(token.sub)

          if (user) {
            session.user.email = user.email
            session.user.name = user.displayName
            session.user.image = user.avatarType === 'photo' ? user.avatar : undefined
          }
        } catch (error) {
          console.error('Session callback error:', error)
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      return token
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  events: {
    async signIn({ user }) {
      console.log(`User ${user.email} signed in`)
    },
    async signOut() {
      console.log(`User signed out`)
    },
  },
  debug: process.env.NODE_ENV === 'development',
})
