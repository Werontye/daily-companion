import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production'

// Helper to check if user is admin
async function isAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string; username?: string; error?: string }> {
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

    return { isAdmin: true, userId: user._id.toString(), username: user.username }
  } catch (err) {
    return { isAdmin: false, error: 'Invalid token' }
  }
}

/**
 * PATCH /api/admin/users/[userId] - Update user (ban, unban, warn, make admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectToDatabase()

    const adminCheck = await isAdmin(request)
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 })
    }

    const { userId } = await params
    const body = await request.json()
    const { action, reason } = body

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent admins from banning other admins
    if (user.isAdmin && (action === 'ban' || action === 'warn')) {
      return NextResponse.json({ error: 'Cannot ban or warn another admin' }, { status: 403 })
    }

    switch (action) {
      case 'ban':
        user.isBanned = true
        user.banReason = reason || 'No reason provided'
        user.bannedAt = new Date()
        user.bannedBy = adminCheck.username
        await user.save()
        return NextResponse.json({
          message: `User @${user.username} has been banned`,
          user: {
            id: user._id.toString(),
            username: user.username,
            isBanned: user.isBanned,
            banReason: user.banReason,
          },
        })

      case 'unban':
        user.isBanned = false
        user.banReason = undefined
        user.bannedAt = undefined
        user.bannedBy = undefined
        await user.save()
        return NextResponse.json({
          message: `User @${user.username} has been unbanned`,
          user: {
            id: user._id.toString(),
            username: user.username,
            isBanned: user.isBanned,
          },
        })

      case 'warn':
        if (!reason) {
          return NextResponse.json({ error: 'Warning reason is required' }, { status: 400 })
        }
        user.warnings = user.warnings || []
        user.warnings.push({
          reason,
          issuedBy: adminCheck.username!,
          issuedAt: new Date(),
        })
        await user.save()
        return NextResponse.json({
          message: `Warning issued to @${user.username}`,
          user: {
            id: user._id.toString(),
            username: user.username,
            warnings: user.warnings,
          },
        })

      case 'clearWarnings':
        user.warnings = []
        await user.save()
        return NextResponse.json({
          message: `Warnings cleared for @${user.username}`,
          user: {
            id: user._id.toString(),
            username: user.username,
            warnings: user.warnings,
          },
        })

      case 'makeAdmin':
        user.isAdmin = true
        await user.save()
        return NextResponse.json({
          message: `User @${user.username} is now an admin`,
          user: {
            id: user._id.toString(),
            username: user.username,
            isAdmin: user.isAdmin,
          },
        })

      case 'removeAdmin':
        // Prevent removing your own admin status
        if (user._id.toString() === adminCheck.userId) {
          return NextResponse.json({ error: 'Cannot remove your own admin status' }, { status: 403 })
        }
        user.isAdmin = false
        await user.save()
        return NextResponse.json({
          message: `Admin status removed from @${user.username}`,
          user: {
            id: user._id.toString(),
            username: user.username,
            isAdmin: user.isAdmin,
          },
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('PATCH /api/admin/users/[userId] error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[userId] - Delete a specific user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectToDatabase()

    const adminCheck = await isAdmin(request)
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 })
    }

    const { userId } = await params
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting admins
    if (user.isAdmin) {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 })
    }

    await User.findByIdAndDelete(userId)

    return NextResponse.json({
      message: `User @${user.username} has been deleted`,
    })
  } catch (error) {
    console.error('DELETE /api/admin/users/[userId] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
