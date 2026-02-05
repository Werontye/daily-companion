import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production'

// Helper to check if user is admin/creator
async function checkAdminAccess(request: NextRequest): Promise<{
  isAdmin: boolean
  isCreator: boolean
  userId?: string
  username?: string
  error?: string
}> {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return { isAdmin: false, isCreator: false, error: 'Not authenticated' }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await User.findById(decoded.userId)

    if (!user) {
      return { isAdmin: false, isCreator: false, error: 'User not found' }
    }

    if (!user.isAdmin) {
      return { isAdmin: false, isCreator: false, error: 'Access denied. Admin only.' }
    }

    return {
      isAdmin: true,
      isCreator: user.isCreator || false,
      userId: user._id.toString(),
      username: user.username,
    }
  } catch (err) {
    return { isAdmin: false, isCreator: false, error: 'Invalid token' }
  }
}

/**
 * GET /api/admin/users - Get all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const adminCheck = await checkAdminAccess(request)
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 })
    }

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })

    return NextResponse.json({
      currentUser: {
        isCreator: adminCheck.isCreator,
        isAdmin: adminCheck.isAdmin,
      },
      users: users.map(user => ({
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        avatarType: user.avatarType,
        bio: user.bio,
        isCreator: user.isCreator || false,
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
 * DELETE /api/admin/users - Delete all users except creator (creator only)
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()

    const adminCheck = await checkAdminAccess(request)
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 })
    }

    // Only creator can mass delete
    if (!adminCheck.isCreator) {
      return NextResponse.json({ error: 'Only the Creator can mass delete users' }, { status: 403 })
    }

    // Delete all users except creator
    const result = await User.deleteMany({ isCreator: { $ne: true } })

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
