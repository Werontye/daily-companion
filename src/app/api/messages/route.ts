import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import { getUserFromRequest } from '@/lib/auth/getUserFromToken'
import DirectMessage from '@/lib/db/models/DirectMessage'
import Friendship from '@/lib/db/models/Friendship'
import User from '@/lib/db/models/User'

// GET /api/messages - Get all conversations with last message
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Get all unique conversations for this user
    const messages = await DirectMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: user.userId },
            { recipient: user.userId },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', user.userId] },
                    { $eq: ['$read', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ])

    // Get user details for each conversation
    const conversations = await Promise.all(
      messages.map(async (conv) => {
        const otherUserId = conv.lastMessage.sender.toString() === user.userId
          ? conv.lastMessage.recipient.toString()
          : conv.lastMessage.sender.toString()

        const otherUser = await User.findById(otherUserId).select(
          'displayName avatar avatarType'
        )

        return {
          conversationId: conv._id,
          otherUser: otherUser
            ? {
                id: otherUser._id.toString(),
                displayName: otherUser.displayName,
                avatar: otherUser.avatar,
                avatarType: otherUser.avatarType,
              }
            : null,
          lastMessage: {
            content: conv.lastMessage.content,
            sender: conv.lastMessage.sender.toString(),
            createdAt: conv.lastMessage.createdAt,
            read: conv.lastMessage.read,
          },
          unreadCount: conv.unreadCount,
        }
      })
    )

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST /api/messages - Send a direct message
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recipientId, content } = body

    if (!recipientId || !content) {
      return NextResponse.json(
        { error: 'Recipient ID and content are required' },
        { status: 400 }
      )
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Message is too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Check if users are friends
    const friendship = await Friendship.findOne({
      $or: [
        { requester: user.userId, recipient: recipientId, status: 'accepted' },
        { requester: recipientId, recipient: user.userId, status: 'accepted' },
      ],
    })

    if (!friendship) {
      return NextResponse.json(
        { error: 'You can only message friends' },
        { status: 403 }
      )
    }

    // Generate conversation ID
    const conversationId = DirectMessage.getConversationId(user.userId, recipientId)

    // Create message
    const message = await DirectMessage.create({
      conversationId,
      sender: user.userId,
      recipient: recipientId,
      content: content.trim(),
      read: false,
    })

    // Get sender info
    const sender = await User.findById(user.userId).select('displayName avatar avatarType')

    return NextResponse.json({
      message: {
        id: message._id.toString(),
        conversationId: message.conversationId,
        sender: {
          id: user.userId,
          displayName: sender?.displayName,
          avatar: sender?.avatar,
          avatarType: sender?.avatarType,
        },
        content: message.content,
        read: message.read,
        createdAt: message.createdAt,
      },
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
