import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import { getUserFromRequest } from '@/lib/auth/getUserFromToken'
import SharedPlan from '@/lib/db/models/SharedPlan'

// PATCH /api/shared-plans/[planId]/members - Update member role
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
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role required' }, { status: 400 })
    }

    if (!['editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    await connectToDatabase()

    const plan = await SharedPlan.findById(planId)
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Only owner can change roles
    if (plan.owner.toString() !== user.userId) {
      return NextResponse.json({ error: 'Only owner can change roles' }, { status: 403 })
    }

    // Cannot change owner's role
    if (userId === plan.owner.toString()) {
      return NextResponse.json({ error: 'Cannot change owner role' }, { status: 400 })
    }

    // Find and update member
    const member = plan.members.find((m) => m.userId.toString() === userId)
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    member.role = role
    await plan.save()

    return NextResponse.json({ message: 'Role updated' })
  } catch (error) {
    console.error('Error updating member role:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

// DELETE /api/shared-plans/[planId]/members - Remove member or leave plan
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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    await connectToDatabase()

    const plan = await SharedPlan.findById(planId)
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const isOwner = plan.owner.toString() === user.userId
    const isSelf = userId === user.userId

    // Owner cannot leave (must delete plan instead)
    if (isSelf && isOwner) {
      return NextResponse.json(
        { error: 'Owner cannot leave. Delete the plan instead.' },
        { status: 400 }
      )
    }

    // Only owner can remove others, anyone can remove themselves
    if (!isSelf && !isOwner) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Remove member
    const memberIndex = plan.members.findIndex((m) => m.userId.toString() === userId)
    if (memberIndex === -1) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    plan.members.splice(memberIndex, 1)
    await plan.save()

    return NextResponse.json({
      message: isSelf ? 'Left plan' : 'Member removed',
    })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}
