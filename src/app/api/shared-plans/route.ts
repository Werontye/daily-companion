import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import { getUserFromRequest } from '@/lib/auth/getUserFromToken'
import SharedPlan from '@/lib/db/models/SharedPlan'
import User from '@/lib/db/models/User'

// GET /api/shared-plans - Get all plans user is member of
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Find all plans where user is owner or member
    const plans = await SharedPlan.find({
      $or: [
        { owner: user.userId },
        { 'members.userId': user.userId },
      ],
    })
      .populate('owner', 'displayName avatar avatarType')
      .populate('members.userId', 'displayName avatar avatarType')
      .sort({ updatedAt: -1 })

    // Transform plans
    const transformedPlans = plans.map((plan: any) => {
      const userRole = plan.owner._id.toString() === user.userId
        ? 'owner'
        : plan.members.find((m: any) => m.userId._id.toString() === user.userId)?.role || 'viewer'

      return {
        id: plan._id.toString(),
        name: plan.name,
        description: plan.description,
        owner: {
          id: plan.owner._id.toString(),
          displayName: plan.owner.displayName,
          avatar: plan.owner.avatar,
          avatarType: plan.owner.avatarType,
        },
        members: plan.members.map((m: any) => ({
          id: m.userId._id.toString(),
          displayName: m.userId.displayName,
          avatar: m.userId.avatar,
          avatarType: m.userId.avatarType,
          role: m.role,
          joinedAt: m.joinedAt,
        })),
        taskCount: plan.tasks.length,
        completedTaskCount: plan.tasks.filter((t: any) => t.status === 'completed').length,
        userRole,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      }
    })

    return NextResponse.json({ plans: transformedPlans })
  } catch (error) {
    console.error('Error fetching shared plans:', error)
    return NextResponse.json({ error: 'Failed to fetch shared plans' }, { status: 500 })
  }
}

// POST /api/shared-plans - Create a new shared plan
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Plan name is required' }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'Plan name is too long (max 100 characters)' }, { status: 400 })
    }

    await connectToDatabase()

    // Create plan with owner as first member
    const plan = await SharedPlan.create({
      name: name.trim(),
      description: description?.trim() || '',
      owner: user.userId,
      members: [
        {
          userId: user.userId,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
      tasks: [],
    })

    // Get owner info
    const owner = await User.findById(user.userId).select('displayName avatar avatarType')

    return NextResponse.json({
      plan: {
        id: plan._id.toString(),
        name: plan.name,
        description: plan.description,
        owner: {
          id: user.userId,
          displayName: owner?.displayName,
          avatar: owner?.avatar,
          avatarType: owner?.avatarType,
        },
        members: [
          {
            id: user.userId,
            displayName: owner?.displayName,
            avatar: owner?.avatar,
            avatarType: owner?.avatarType,
            role: 'owner',
            joinedAt: plan.members[0].joinedAt,
          },
        ],
        tasks: [],
        taskCount: 0,
        completedTaskCount: 0,
        userRole: 'owner',
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error creating shared plan:', error)
    return NextResponse.json({ error: 'Failed to create shared plan' }, { status: 500 })
  }
}
