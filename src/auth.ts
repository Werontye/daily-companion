import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import connectToDatabase from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
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
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      try {
        await connectToDatabase()

        // For OAuth providers (Google, GitHub)
        if (account?.provider === 'google' || account?.provider === 'github') {
          // Check if user exists
          let existingUser = await User.findOne({ email: user.email.toLowerCase() })

          if (!existingUser) {
            // Create new user from OAuth
            existingUser = await User.create({
              email: user.email.toLowerCase(),
              displayName: user.name || user.email.split('@')[0],
              avatar: user.image || user.name?.charAt(0).toUpperCase() || 'U',
              avatarType: user.image ? 'photo' : 'initial',
              provider: account.provider,
              providerId: account.providerAccountId,
              isEmailVerified: true,
              lastLogin: new Date(),
            })
          } else {
            // Update existing user's last login
            existingUser.lastLogin = new Date()
            await existingUser.save()
          }

          // Store user ID in the user object for the session callback
          user.id = existingUser._id.toString()
        }

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
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      if (account) {
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
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
    async signIn({ user, account }) {
      console.log(`User ${user.email} signed in with ${account?.provider}`)
    },
    async signOut() {
      console.log(`User signed out`)
    },
  },
  debug: process.env.NODE_ENV === 'development',
})
