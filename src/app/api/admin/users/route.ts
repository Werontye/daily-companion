import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production'

// Helper to check if user is admin
async function isAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return { isAdmin: false, error: 'Not authenticated' }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await User.findById(decoded.userId)

    if (!user) {
      return { isAdmin: false, error: 'User not found' }
    }

    if (!user.isAdmin) {
      return { isAdmin: false, error: 'Access denied. Admin only.' }
    }

    return { isAdmin: true, userId: user._id.toString() }
  } catch (err) {
    return { isAdmin: false, error: 'Invalid token' }
  }
}

/**
 * GET /api/admin/users - Get all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const adminCheck = await isAdmin(request)
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 })
    }

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })

    return NextResponse.json({
      users: users.map(user => ({
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        avatarType: user.avatarType,
        bio: user.bio,
        isAdmin: user.isAdmin,
        isBanned: user.isBanned,
        banReason: user.banReason,
        bannedAt: user.bannedAt,
        warnings: user.warnings || [],
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      })),
    })
  } catch (error) {
    console.error('GET /api/admin/users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users - Delete all users except admins (admin only, for cleanup)
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()

    const adminCheck = await isAdmin(request)
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 })
    }

    // Delete all non-admin users
    const result = await User.deleteMany({ isAdmin: { $ne: true } })

    return NextResponse.json({
      message: `Deleted ${result.deletedCount} users`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error('DELETE /api/admin/users error:', error)
    return NextResponse.json(
      { error: 'Failed to delete users' },
      { status: 500 }
    )
  }
}
