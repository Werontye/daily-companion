import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import { getUserFromRequest } from '@/lib/auth/getUserFromToken'
import SharedPlan from '@/lib/db/models/SharedPlan'
import SharedPlanMessage from '@/lib/db/models/SharedPlanMessage'

// GET /api/shared-plans/[planId]/messages - Get plan messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const before = searchParams.get('before')

    await connectToDatabase()

    // Check if user is member
    const plan = await SharedPlan.findById(planId)
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const isMember = plan.owner.toString() === user.userId ||
      plan.members.some((m) => m.userId.toString() === user.userId)

    if (!isMember) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Build query
    const query: Record<string, unknown> = { planId }
    if (before) {
      query.createdAt = { $lt: new Date(before) }
    }

    // Get messages
    const messages = await SharedPlanMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'displayName avatar avatarType')

    const transformedMessages = messages.map((m: any) => ({
      id: m._id.toString(),
      content: m.content,
      sender: {
        id: m.sender._id.toString(),
        displayName: m.sender.displayName,
        avatar: m.sender.avatar,
        avatarType: m.sender.avatarType,
      },
      createdAt: m.createdAt,
    }))

    return NextResponse.json({
      messages: transformedMessages.reverse(),
      hasMore: messages.length === limit,
    })
  } catch (error) {
    console.error('Error fetching plan messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST /api/shared-plans/[planId]/messages - Send message to plan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await params
    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
    }

    await connectToDatabase()

    // Check if user is member
    const plan = await SharedPlan.findById(planId)
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const isMember = plan.owner.toString() === user.userId ||
      plan.members.some((m) => m.userId.toString() === user.userId)

    if (!isMember) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Create message
    const message = await SharedPlanMessage.create({
      planId,
      sender: user.userId,
      content: content.trim(),
    })

    await message.populate('sender', 'displayName avatar avatarType')

    const populatedMessage = message as any
    return NextResponse.json({
      message: {
        id: populatedMessage._id.toString(),
        content: populatedMessage.content,
        sender: {
          id: populatedMessage.sender._id.toString(),
          displayName: populatedMessage.sender.displayName,
          avatar: populatedMessage.sender.avatar,
          avatarType: populatedMessage.sender.avatarType,
        },
        createdAt: populatedMessage.createdAt,
      },
    })
  } catch (error) {
    console.error('Error sending plan message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
