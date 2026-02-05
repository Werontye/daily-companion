import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production'
const ADMIN_SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || 'daily-companion-admin-setup-2024'

/**
 * POST /api/admin/setup - Make current user an admin/creator
 * First user becomes Creator (can manage admins)
 * Others need secret to become admin
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

    if (user.isCreator) {
      return NextResponse.json({
        message: 'You are the Creator',
        isCreator: true,
        isAdmin: true,
      })
    }

    if (user.isAdmin) {
      return NextResponse.json({
        message: 'You are already an admin',
        isAdmin: true,
      })
    }

    // Check if there is a creator yet
    const creatorCount = await User.countDocuments({ isCreator: true })

    // If no creator exists, make this user the Creator
    if (creatorCount === 0) {
      user.isCreator = true
      user.isAdmin = true
      await user.save()

      return NextResponse.json({
        message: `You are now the Creator, @${user.username}! You can manage all admins and users.`,
        isCreator: true,
        isAdmin: true,
      })
    }

    // If secret is provided, make them an admin (but not creator)
    if (secret === ADMIN_SETUP_SECRET) {
      user.isAdmin = true
      await user.save()

      return NextResponse.json({
        message: `You are now an admin, @${user.username}!`,
        isAdmin: true,
      })
    }

    return NextResponse.json(
      { error: 'Admin setup not allowed. Contact the Creator.' },
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
