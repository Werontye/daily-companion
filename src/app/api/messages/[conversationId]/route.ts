import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import { getUserFromRequest } from '@/lib/auth/getUserFromToken'
import DirectMessage from '@/lib/db/models/DirectMessage'
import User from '@/lib/db/models/User'

// GET /api/messages/[conversationId] - Get messages in a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const before = searchParams.get('before') // Cursor for pagination

    await connectToDatabase()

    // Verify user is part of this conversation
    const userIds = conversationId.split('_')
    if (!userIds.includes(user.userId)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Build query
    const query: Record<string, unknown> = { conversationId }
    if (before) {
      query.createdAt = { $lt: new Date(before) }
    }

    // Get messages
    const messages = await DirectMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'displayName avatar avatarType')

    // Transform messages
    const transformedMessages = messages.map((m: any) => ({
      id: m._id.toString(),
      content: m.content,
      sender: {
        id: m.sender._id.toString(),
        displayName: m.sender.displayName,
        avatar: m.sender.avatar,
        avatarType: m.sender.avatarType,
      },
      read: m.read,
      createdAt: m.createdAt,
    }))

    // Get other user info
    const otherUserId = userIds.find((id) => id !== user.userId)
    const otherUser = await User.findById(otherUserId).select(
      'displayName avatar avatarType'
    )

    return NextResponse.json({
      messages: transformedMessages.reverse(), // Oldest first
      otherUser: otherUser
        ? {
            id: otherUser._id.toString(),
            displayName: otherUser.displayName,
            avatar: otherUser.avatar,
            avatarType: otherUser.avatarType,
          }
        : null,
      hasMore: messages.length === limit,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// PATCH /api/messages/[conversationId] - Mark messages as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = await params

    await connectToDatabase()

    // Verify user is part of this conversation
    const userIds = conversationId.split('_')
    if (!userIds.includes(user.userId)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Mark all unread messages sent to this user as read
    const result = await DirectMessage.updateMany(
      {
        conversationId,
        recipient: user.userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    )

    return NextResponse.json({
      message: 'Messages marked as read',
      count: result.modifiedCount,
    })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 })
  }
}
