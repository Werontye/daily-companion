import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import { getUserFromRequest } from '@/lib/auth/getUserFromToken'
import SharedPlan from '@/lib/db/models/SharedPlan'
import SharedPlanInvitation from '@/lib/db/models/SharedPlanInvitation'
import Notification from '@/lib/db/models/Notification'
import User from '@/lib/db/models/User'

// GET /api/shared-plans/invitations - Get user's pending invitations
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const invitations = await SharedPlanInvitation.find({
      invitedUser: user.userId,
      status: 'pending',
    })
      .populate('planId', 'name description')
      .populate('invitedBy', 'displayName avatar avatarType')

    const transformedInvitations = invitations.map((inv) => ({
      id: inv._id.toString(),
      plan: {
        id: inv.planId._id.toString(),
        name: inv.planId.name,
        description: inv.planId.description,
      },
      invitedBy: {
        id: inv.invitedBy._id.toString(),
        displayName: inv.invitedBy.displayName,
        avatar: inv.invitedBy.avatar,
        avatarType: inv.invitedBy.avatarType,
      },
      role: inv.role,
      createdAt: inv.createdAt,
    }))

    return NextResponse.json({ invitations: transformedInvitations })
  } catch (error) {
    console.error('Error fetching user invitations:', error)
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
  }
}

// PATCH /api/shared-plans/invitations - Accept or decline invitation
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { invitationId, action } = body

    if (!invitationId || !action) {
      return NextResponse.json({ error: 'Invitation ID and action required' }, { status: 400 })
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    await connectToDatabase()

    const invitation = await SharedPlanInvitation.findById(invitationId)

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.invitedUser.toString() !== user.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation is no longer pending' }, { status: 400 })
    }

    if (action === 'accept') {
      // Add user to plan members
      const plan = await SharedPlan.findById(invitation.planId)
      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
      }

      plan.members.push({
        userId: user.userId,
        role: invitation.role,
        joinedAt: new Date(),
      })
      await plan.save()

      // Create notification for inviter
      const accepter = await User.findById(user.userId)
      await Notification.create({
        userId: invitation.invitedBy.toString(),
        title: 'Invitation Accepted',
        message: `${accepter?.displayName || 'Someone'} joined "${plan.name}"`,
        type: 'system',
        relatedId: plan._id.toString(),
      })
    }

    invitation.status = action === 'accept' ? 'accepted' : 'declined'
    await invitation.save()

    return NextResponse.json({
      message: action === 'accept' ? 'Joined plan' : 'Invitation declined',
    })
  } catch (error) {
    console.error('Error responding to invitation:', error)
    return NextResponse.json({ error: 'Failed to respond to invitation' }, { status: 500 })
  }
}
