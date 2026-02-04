import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import { getUserFromRequest } from '@/lib/auth/getUserFromToken'
import Friendship from '@/lib/db/models/Friendship'
import User from '@/lib/db/models/User'
import Notification from '@/lib/db/models/Notification'

// GET /api/friends - Get all friends and pending requests
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Get accepted friendships
    const acceptedFriendships = await Friendship.find({
      $or: [
        { requester: user.userId, status: 'accepted' },
        { recipient: user.userId, status: 'accepted' },
      ],
    }).populate('requester recipient', 'displayName email avatar avatarType')

    // Get pending requests (received)
    const pendingRequests = await Friendship.find({
      recipient: user.userId,
      status: 'pending',
    }).populate('requester', 'displayName email avatar avatarType')

    // Get sent requests (pending)
    const sentRequests = await Friendship.find({
      requester: user.userId,
      status: 'pending',
    }).populate('recipient', 'displayName email avatar avatarType')

    // Transform friends data
    const friends = acceptedFriendships.map((f: any) => {
      const friend: any = f.requester._id.toString() === user.userId ? f.recipient : f.requester
      return {
        friendshipId: f._id.toString(),
        id: friend._id.toString(),
        displayName: friend.displayName,
        email: friend.email,
        avatar: friend.avatar,
        avatarType: friend.avatarType,
        since: f.updatedAt,
      }
    })

    // Transform pending requests
    const pending = pendingRequests.map((f: any) => ({
      friendshipId: f._id.toString(),
      id: f.requester._id.toString(),
      displayName: f.requester.displayName,
      email: f.requester.email,
      avatar: f.requester.avatar,
      avatarType: f.requester.avatarType,
      requestedAt: f.createdAt,
    }))

    // Transform sent requests
    const sent = sentRequests.map((f: any) => ({
      friendshipId: f._id.toString(),
      id: f.recipient._id.toString(),
      displayName: f.recipient.displayName,
      email: f.recipient.email,
      avatar: f.recipient.avatar,
      avatarType: f.recipient.avatarType,
      requestedAt: f.createdAt,
    }))

    return NextResponse.json({
      friends,
      pendingRequests: pending,
      sentRequests: sent,
    })
  } catch (error) {
    console.error('Error fetching friends:', error)
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 })
  }
}

// POST /api/friends - Send a friend request
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recipientId } = body

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 })
    }

    if (recipientId === user.userId) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 })
    }

    await connectToDatabase()

    // Check if recipient exists
    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: user.userId, recipient: recipientId },
        { requester: recipientId, recipient: user.userId },
      ],
    })

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 })
      }
      if (existingFriendship.status === 'pending') {
        return NextResponse.json({ error: 'Friend request already pending' }, { status: 400 })
      }
      if (existingFriendship.status === 'blocked') {
        return NextResponse.json({ error: 'Cannot send friend request' }, { status: 400 })
      }
    }

    // Create friendship request
    const friendship = await Friendship.create({
      requester: user.userId,
      recipient: recipientId,
      status: 'pending',
    })

    // Create notification for recipient
    const sender = await User.findById(user.userId)
    await Notification.create({
      userId: recipientId,
      title: 'New Friend Request',
      message: `${sender?.displayName || 'Someone'} sent you a friend request`,
      type: 'friend_request',
      relatedId: friendship._id.toString(),
      actionTaken: false,
    })

    return NextResponse.json({
      message: 'Friend request sent',
      friendshipId: friendship._id.toString(),
    })
  } catch (error) {
    console.error('Error sending friend request:', error)
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 })
  }
}

// PATCH /api/friends - Accept or decline a friend request
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { friendshipId, action } = body

    if (!friendshipId || !action) {
      return NextResponse.json({ error: 'Friendship ID and action are required' }, { status: 400 })
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    await connectToDatabase()

    const friendship = await Friendship.findById(friendshipId)

    if (!friendship) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
    }

    // Only recipient can accept/decline
    if (friendship.recipient.toString() !== user.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (friendship.status !== 'pending') {
      return NextResponse.json({ error: 'Friend request is no longer pending' }, { status: 400 })
    }

    friendship.status = action === 'accept' ? 'accepted' : 'declined'
    await friendship.save()

    // Mark the friend request notification as action taken
    await Notification.updateMany(
      {
        userId: user.userId,
        type: 'friend_request',
        relatedId: friendshipId,
      },
      { actionTaken: true, read: true }
    )

    // Create notification for requester if accepted
    if (action === 'accept') {
      const accepter = await User.findById(user.userId)
      await Notification.create({
        userId: friendship.requester.toString(),
        title: 'Friend Request Accepted',
        message: `${accepter?.displayName || 'Someone'} accepted your friend request`,
        type: 'system',
        relatedId: friendship._id.toString(),
      })
    }

    return NextResponse.json({
      message: action === 'accept' ? 'Friend request accepted' : 'Friend request declined',
      status: friendship.status,
    })
  } catch (error) {
    console.error('Error updating friend request:', error)
    return NextResponse.json({ error: 'Failed to update friend request' }, { status: 500 })
  }
}

// DELETE /api/friends - Remove friend or cancel request
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const friendshipId = searchParams.get('id')

    if (!friendshipId) {
      return NextResponse.json({ error: 'Friendship ID is required' }, { status: 400 })
    }

    await connectToDatabase()

    const friendship = await Friendship.findById(friendshipId)

    if (!friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 })
    }

    // User must be either requester or recipient
    const isRequester = friendship.requester.toString() === user.userId
    const isRecipient = friendship.recipient.toString() === user.userId

    if (!isRequester && !isRecipient) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    await Friendship.findByIdAndDelete(friendshipId)

    return NextResponse.json({ message: 'Friendship removed' })
  } catch (error) {
    console.error('Error removing friend:', error)
    return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 })
  }
}
