import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import { getUserFromRequest } from '@/lib/auth/getUserFromToken'
import User from '@/lib/db/models/User'
import Friendship from '@/lib/db/models/Friendship'

// GET /api/friends/search - Search users by name or email
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [] })
    }

    await connectToDatabase()

    // Search users by name or email (case-insensitive)
    const searchRegex = new RegExp(query.trim(), 'i')

    const users = await User.find({
      _id: { $ne: user.userId }, // Exclude current user
      $or: [
        { displayName: searchRegex },
        { email: searchRegex },
      ],
    })
      .select('displayName email avatar avatarType')
      .limit(20)

    // Get existing friendships to show status
    const userIds = users.map((u) => u._id)
    const friendships = await Friendship.find({
      $or: [
        { requester: user.userId, recipient: { $in: userIds } },
        { recipient: user.userId, requester: { $in: userIds } },
      ],
    })

    // Create a map of user ID to friendship status
    const friendshipMap = new Map<string, { status: string; isRequester: boolean }>()
    friendships.forEach((f) => {
      const otherId = f.requester.toString() === user.userId
        ? f.recipient.toString()
        : f.requester.toString()
      friendshipMap.set(otherId, {
        status: f.status,
        isRequester: f.requester.toString() === user.userId,
      })
    })

    // Transform users with friendship status
    const usersWithStatus = users.map((u) => {
      const friendship = friendshipMap.get(u._id.toString())
      return {
        id: u._id.toString(),
        displayName: u.displayName,
        email: u.email,
        avatar: u.avatar,
        avatarType: u.avatarType,
        friendshipStatus: friendship?.status || null,
        isRequester: friendship?.isRequester || false,
      }
    })

    return NextResponse.json({ users: usersWithStatus })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
  }
}
