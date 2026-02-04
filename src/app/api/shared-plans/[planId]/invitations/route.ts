import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import { getUserFromRequest } from '@/lib/auth/getUserFromToken'
import SharedPlan from '@/lib/db/models/SharedPlan'
import SharedPlanInvitation from '@/lib/db/models/SharedPlanInvitation'
import Notification from '@/lib/db/models/Notification'
import User from '@/lib/db/models/User'

// GET /api/shared-plans/[planId]/invitations - Get pending invitations for plan
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
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check if user can view invitations (owner or editor)
    const isOwner = plan.owner.toString() === user.userId
    const member = plan.members.find((m) => m.userId.toString() === user.userId)
    const canManage = isOwner || member?.role === 'editor' || member?.role === 'owner'

    if (!canManage) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const invitations = await SharedPlanInvitation.find({
      planId,
      status: 'pending',
    })
      .populate('invitedUser', 'displayName email avatar avatarType')
      .populate('invitedBy', 'displayName')

    const transformedInvitations = invitations.map((inv: any) => ({
      id: inv._id.toString(),
      invitedUser: {
        id: inv.invitedUser._id.toString(),
        displayName: inv.invitedUser.displayName,
        email: inv.invitedUser.email,
        avatar: inv.invitedUser.avatar,
        avatarType: inv.invitedUser.avatarType,
      },
      invitedBy: {
        id: inv.invitedBy._id.toString(),
        displayName: inv.invitedBy.displayName,
      },
      role: inv.role,
      createdAt: inv.createdAt,
    }))

    return NextResponse.json({ invitations: transformedInvitations })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
  }
}

// POST /api/shared-plans/[planId]/invitations - Invite user to plan
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
    const { userId, role = 'editor' } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!['editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    await connectToDatabase()

    const plan = await SharedPlan.findById(planId)
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check if user can invite (owner or editor)
    const isOwner = plan.owner.toString() === user.userId
    const member = plan.members.find((m) => m.userId.toString() === user.userId)
    const canInvite = isOwner || member?.role === 'editor' || member?.role === 'owner'

    if (!canInvite) {
      return NextResponse.json({ error: 'Not authorized to invite' }, { status: 403 })
    }

    // Check if user is already a member
    const isAlreadyMember = plan.owner.toString() === userId ||
      plan.members.some((m) => m.userId.toString() === userId)

    if (isAlreadyMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
    }

    // Check if invitation already exists
    const existingInvitation = await SharedPlanInvitation.findOne({
      planId,
      invitedUser: userId,
      status: 'pending',
    })

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent' }, { status: 400 })
    }

    // Create invitation
    const invitation = await SharedPlanInvitation.create({
      planId,
      invitedBy: user.userId,
      invitedUser: userId,
      role,
      status: 'pending',
    })

    // Create notification
    const inviter = await User.findById(user.userId)
    await Notification.create({
      userId,
      title: 'Plan Invitation',
      message: `${inviter?.displayName || 'Someone'} invited you to join "${plan.name}"`,
      type: 'system',
      relatedId: invitation._id.toString(),
    })

    return NextResponse.json({
      message: 'Invitation sent',
      invitationId: invitation._id.toString(),
    })
  } catch (error) {
    console.error('Error sending invitation:', error)
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
  }
}

// DELETE /api/shared-plans/[planId]/invitations - Cancel invitation
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
    const invitationId = searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 })
    }

    await connectToDatabase()

    const plan = await SharedPlan.findById(planId)
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check if user can cancel invitations
    const isOwner = plan.owner.toString() === user.userId
    const member = plan.members.find((m) => m.userId.toString() === user.userId)
    const canManage = isOwner || member?.role === 'editor' || member?.role === 'owner'

    if (!canManage) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    await SharedPlanInvitation.findByIdAndDelete(invitationId)

    return NextResponse.json({ message: 'Invitation cancelled' })
  } catch (error) {
    console.error('Error cancelling invitation:', error)
    return NextResponse.json({ error: 'Failed to cancel invitation' }, { status: 500 })
  }
}
