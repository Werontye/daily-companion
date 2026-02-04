import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import { getUserFromRequest } from '@/lib/auth/getUserFromToken'
import SharedPlan from '@/lib/db/models/SharedPlan'
import SharedPlanInvitation from '@/lib/db/models/SharedPlanInvitation'
import SharedPlanMessage from '@/lib/db/models/SharedPlanMessage'

// GET /api/shared-plans/[planId] - Get plan details
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

    await connectToDatabase()

    const plan = await SharedPlan.findById(planId)
      .populate('owner', 'displayName avatar avatarType email')
      .populate('members.userId', 'displayName avatar avatarType email')
      .populate('tasks.assignedTo', 'displayName avatar avatarType')
      .populate('tasks.createdBy', 'displayName avatar avatarType')

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check if user is member
    const isMember = plan.owner._id.toString() === user.userId ||
      plan.members.some((m) => m.userId._id.toString() === user.userId)

    if (!isMember) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const userRole = plan.owner._id.toString() === user.userId
      ? 'owner'
      : plan.members.find((m) => m.userId._id.toString() === user.userId)?.role || 'viewer'

    return NextResponse.json({
      plan: {
        id: plan._id.toString(),
        name: plan.name,
        description: plan.description,
        owner: {
          id: plan.owner._id.toString(),
          displayName: plan.owner.displayName,
          avatar: plan.owner.avatar,
          avatarType: plan.owner.avatarType,
          email: plan.owner.email,
        },
        members: plan.members.map((m) => ({
          id: m.userId._id.toString(),
          displayName: m.userId.displayName,
          avatar: m.userId.avatar,
          avatarType: m.userId.avatarType,
          email: m.userId.email,
          role: m.role,
          joinedAt: m.joinedAt,
        })),
        tasks: plan.tasks.map((t) => ({
          id: t._id.toString(),
          title: t.title,
          description: t.description,
          status: t.status,
          assignedTo: t.assignedTo ? {
            id: t.assignedTo._id.toString(),
            displayName: t.assignedTo.displayName,
            avatar: t.assignedTo.avatar,
            avatarType: t.assignedTo.avatarType,
          } : null,
          createdBy: {
            id: t.createdBy._id.toString(),
            displayName: t.createdBy.displayName,
            avatar: t.createdBy.avatar,
            avatarType: t.createdBy.avatarType,
          },
          createdAt: t.createdAt,
          completedAt: t.completedAt,
        })),
        userRole,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error fetching shared plan:', error)
    return NextResponse.json({ error: 'Failed to fetch shared plan' }, { status: 500 })
  }
}

// PATCH /api/shared-plans/[planId] - Update plan name/description
export async function PATCH(
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
    const { name, description } = body

    await connectToDatabase()

    const plan = await SharedPlan.findById(planId)

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check if user is owner or editor
    const isOwner = plan.owner.toString() === user.userId
    const member = plan.members.find((m) => m.userId.toString() === user.userId)
    const isEditor = member?.role === 'editor' || member?.role === 'owner'

    if (!isOwner && !isEditor) {
      return NextResponse.json({ error: 'Not authorized to edit this plan' }, { status: 403 })
    }

    // Update plan
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: 'Plan name cannot be empty' }, { status: 400 })
      }
      plan.name = name.trim()
    }

    if (description !== undefined) {
      plan.description = description?.trim() || ''
    }

    await plan.save()

    return NextResponse.json({
      message: 'Plan updated',
      plan: {
        id: plan._id.toString(),
        name: plan.name,
        description: plan.description,
      },
    })
  } catch (error) {
    console.error('Error updating shared plan:', error)
    return NextResponse.json({ error: 'Failed to update shared plan' }, { status: 500 })
  }
}

// DELETE /api/shared-plans/[planId] - Delete plan (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await params

    await connectToDatabase()

    const plan = await SharedPlan.findById(planId)

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Only owner can delete
    if (plan.owner.toString() !== user.userId) {
      return NextResponse.json({ error: 'Only the owner can delete this plan' }, { status: 403 })
    }

    // Delete plan and related data
    await Promise.all([
      SharedPlan.findByIdAndDelete(planId),
      SharedPlanInvitation.deleteMany({ planId }),
      SharedPlanMessage.deleteMany({ planId }),
    ])

    return NextResponse.json({ message: 'Plan deleted' })
  } catch (error) {
    console.error('Error deleting shared plan:', error)
    return NextResponse.json({ error: 'Failed to delete shared plan' }, { status: 500 })
  }
}
