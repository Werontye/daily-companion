import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectToDatabase from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        await connectToDatabase()

        const user = await User.findOne({
          username: (credentials.username as string).toLowerCase()
        }).select('+password')

        if (!user || !user.password) {
          return null
        }

        // Check if user is banned
        if (user.isBanned) {
          throw new Error('Your account has been banned')
        }

        const isValid = await user.comparePassword(credentials.password as string)
        if (!isValid) {
          return null
        }

        return {
          id: user._id.toString(),
          name: user.displayName,
          email: user.username, // Using email field for username (NextAuth compatibility)
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
      if (!user.email) return false // email is username

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
            session.user.email = user.username // Using email field for username
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
        token.email = user.email // This is actually the username
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
      console.log(`User ${user.email} signed in`) // email is username
    },
    async signOut() {
      console.log(`User signed out`)
    },
  },
  debug: process.env.NODE_ENV === 'development',
})
