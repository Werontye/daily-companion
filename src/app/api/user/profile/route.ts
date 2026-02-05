import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import { getUserFromRequest } from '@/lib/auth/getUserFromToken'
import mongoose from 'mongoose'

/**
 * PATCH /api/user/profile - Update user profile
 * Allows updating displayName, bio, avatar, and avatarType
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const body = await request.json()
    const { displayName, bio, avatar, avatarType, socialLinks } = body

    // Build update object with only provided fields
    const updates: any = {}
    if (displayName !== undefined) updates.displayName = displayName.trim()
    if (bio !== undefined) updates.bio = bio.trim()
    if (avatar !== undefined) updates.avatar = avatar
    if (avatarType !== undefined) updates.avatarType = avatarType
    if (socialLinks !== undefined) {
      updates.socialLinks = {
        twitter: socialLinks.twitter?.trim() || '',
        instagram: socialLinks.instagram?.trim() || '',
        telegram: socialLinks.telegram?.trim() || '',
        github: socialLinks.github?.trim() || '',
        website: socialLinks.website?.trim() || '',
      }
    }

    // Validate displayName if provided
    if (updates.displayName !== undefined && !updates.displayName) {
      return NextResponse.json(
        { error: 'Display name cannot be empty' },
        { status: 400 }
      )
    }

    // Validate bio length if provided
    if (updates.bio !== undefined && updates.bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(user.userId),
      updates,
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        avatarType: updatedUser.avatarType,
        socialLinks: updatedUser.socialLinks || {},
        createdAt: updatedUser.createdAt,
      }
    })
  } catch (error) {
    console.error('PATCH /api/user/profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
