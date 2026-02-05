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
 * PATCH /api/admin/users/[userId] - Update user (ban, unban, warn, make admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectToDatabase()

    const adminCheck = await checkAdminAccess(request)
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

    // Prevent actions on creator (only creator can modify themselves)
    if (user.isCreator && user._id.toString() !== adminCheck.userId) {
      return NextResponse.json({ error: 'Cannot modify the Creator' }, { status: 403 })
    }

    // Only creator can modify admin status
    if ((action === 'makeAdmin' || action === 'removeAdmin') && !adminCheck.isCreator) {
      return NextResponse.json({ error: 'Only the Creator can manage admin rights' }, { status: 403 })
    }

    // Prevent admins from banning other admins (unless creator)
    if (user.isAdmin && (action === 'ban' || action === 'warn') && !adminCheck.isCreator) {
      return NextResponse.json({ error: 'Only the Creator can ban or warn admins' }, { status: 403 })
    }

    switch (action) {
      case 'ban':
        if (user.isCreator) {
          return NextResponse.json({ error: 'Cannot ban the Creator' }, { status: 403 })
        }
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
        if (user.isBanned) {
          return NextResponse.json({ error: 'Cannot make a banned user an admin' }, { status: 400 })
        }
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
        // Prevent removing creator's admin status
        if (user.isCreator) {
          return NextResponse.json({ error: 'Cannot remove Creator admin status' }, { status: 403 })
        }
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
 * DELETE /api/admin/users/[userId] - Delete a specific user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectToDatabase()

    const adminCheck = await checkAdminAccess(request)
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 })
    }

    const { userId } = await params
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting creator
    if (user.isCreator) {
      return NextResponse.json({ error: 'Cannot delete the Creator' }, { status: 403 })
    }

    // Only creator can delete admins
    if (user.isAdmin && !adminCheck.isCreator) {
      return NextResponse.json({ error: 'Only the Creator can delete admins' }, { status: 403 })
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
