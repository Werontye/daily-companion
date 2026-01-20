import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { auth } from '@/auth'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production'

export interface TokenPayload {
  userId: string
  email: string
}

/**
 * Get user from request - supports both custom JWT (auth_token) and NextAuth session
 * Use this in API routes instead of getUserFromToken
 */
export async function getUserFromRequest(request: NextRequest): Promise<TokenPayload | null> {
  // 1. First check custom JWT token (for backwards compatibility with email/password login)
  const customToken = request.cookies.get('auth_token')?.value
  if (customToken) {
    try {
      const decoded = jwt.verify(customToken, JWT_SECRET) as TokenPayload
      return decoded
    } catch (error) {
      // Token invalid, continue to check NextAuth
    }
  }

  // 2. Fallback to NextAuth session (for OAuth login - Google, GitHub)
  try {
    const session = await auth()
    if (session?.user?.id) {
      return {
        userId: session.user.id,
        email: session.user.email || '',
      }
    }
  } catch (error) {
    console.error('Error getting NextAuth session:', error)
  }

  return null
}

/**
 * @deprecated Use getUserFromRequest instead - this only checks custom JWT token
 */
export function getUserFromToken(request: NextRequest): TokenPayload | null {
  try {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}
