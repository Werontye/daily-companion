import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production'

export interface TokenPayload {
  userId: string
  email: string
}

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
