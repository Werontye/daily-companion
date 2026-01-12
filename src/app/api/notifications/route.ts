import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import Notification from '@/lib/db/models/Notification'
import { getUserFromToken } from '@/lib/auth/getUserFromToken'
import mongoose from 'mongoose'

/**
 * GET /api/notifications - Get user notifications
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const userId = new mongoose.Types.ObjectId(user.userId)

    // Get notifications, sorted by newest first
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)

    return NextResponse.json({
      notifications: notifications.map(notif => ({
        id: notif._id.toString(),
        title: notif.title,
        message: notif.message,
        type: notif.type,
        read: notif.read,
        time: notif.createdAt,
        relatedId: notif.relatedId,
      }))
    })
  } catch (error) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications - Mark notification(s) as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const userId = new mongoose.Types.ObjectId(user.userId)
    const body = await request.json()
    const { notificationId, markAllRead } = body

    if (markAllRead) {
      // Mark all user notifications as read
      await Notification.updateMany(
        { userId, read: false },
        { read: true }
      )
    } else if (notificationId) {
      // Mark specific notification as read
      await Notification.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(notificationId), userId },
        { read: true }
      )
    } else {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}
