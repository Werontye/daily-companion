import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production'
const ADMIN_SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || 'daily-companion-admin-setup-2024'

/**
 * POST /api/admin/setup - Make current user an admin (requires secret or first user)
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { secret } = body

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.isAdmin) {
      return NextResponse.json(
        { message: 'You are already an admin', isAdmin: true }
      )
    }

    // Check if there are any admins yet
    const adminCount = await User.countDocuments({ isAdmin: true })

    // If no admins exist, make this user admin
    // Or if correct secret is provided
    if (adminCount === 0 || secret === ADMIN_SETUP_SECRET) {
      user.isAdmin = true
      await user.save()

      return NextResponse.json({
        message: `You are now an admin, @${user.username}!`,
        isAdmin: true,
      })
    }

    return NextResponse.json(
      { error: 'Admin setup not allowed' },
      { status: 403 }
    )
  } catch (error) {
    console.error('POST /api/admin/setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup admin' },
      { status: 500 }
    )
  }
}
