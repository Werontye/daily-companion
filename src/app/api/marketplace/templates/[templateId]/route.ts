import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import { PublicTemplate } from '@/lib/db/models/PublicTemplate'
import User from '@/lib/db/models/User'
import { auth } from '@/auth'

// GET - Get single template details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params
    await connectToDatabase()

    const template = await PublicTemplate.findById(templateId)
      .populate('author', 'displayName avatar avatarType')
      .lean() as any

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Check if current user has liked/disliked this template
    let isLiked = false
    let isDisliked = false
    const session = await auth()
    if (session?.user) {
      const user = await User.findOne({ email: session.user.email })
      if (user) {
        isLiked = template.likedBy?.some(
          (id: any) => id.toString() === user._id.toString()
        ) || false
        isDisliked = template.dislikedBy?.some(
          (id: any) => id.toString() === user._id.toString()
        ) || false
      }
    }

    return NextResponse.json({
      template: {
        id: template._id.toString(),
        name: template.name,
        description: template.description,
        category: template.category,
        icon: template.icon,
        color: template.color,
        tasks: template.tasks.map((task: any) => ({
          title: task.title,
          duration: task.duration,
          priority: task.priority,
        })),
        author: template.author ? {
          id: template.author._id.toString(),
          displayName: template.author.displayName,
          avatar: template.author.avatar,
          avatarType: template.author.avatarType,
        } : null,
        usageCount: template.usageCount,
        likesCount: template.likesCount,
        dislikesCount: template.dislikesCount || 0,
        isLiked,
        isDisliked,
        tags: template.tags,
        createdAt: template.createdAt,
      },
    })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

// PATCH - Like/unlike or use template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { templateId } = await params
    await connectToDatabase()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { action } = body // 'like', 'unlike', 'use'

    const template = await PublicTemplate.findById(templateId)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (action === 'like') {
      const alreadyLiked = template.likedBy.some(
        (id: any) => id.toString() === user._id.toString()
      )
      if (!alreadyLiked) {
        // Remove from dislikes if exists
        template.dislikedBy = template.dislikedBy?.filter(
          (id: any) => id.toString() !== user._id.toString()
        ) || []
        template.dislikesCount = template.dislikedBy.length

        template.likedBy.push(user._id)
        template.likesCount = template.likedBy.length
        await template.save()
      }
      return NextResponse.json({
        message: 'Template liked',
        likesCount: template.likesCount,
        dislikesCount: template.dislikesCount || 0,
        isLiked: true,
        isDisliked: false,
      })
    }

    if (action === 'unlike') {
      template.likedBy = template.likedBy.filter(
        (id: any) => id.toString() !== user._id.toString()
      )
      template.likesCount = template.likedBy.length
      await template.save()
      return NextResponse.json({
        message: 'Template unliked',
        likesCount: template.likesCount,
        dislikesCount: template.dislikesCount || 0,
        isLiked: false,
        isDisliked: false,
      })
    }

    if (action === 'dislike') {
      const alreadyDisliked = template.dislikedBy?.some(
        (id: any) => id.toString() === user._id.toString()
      )
      if (!alreadyDisliked) {
        // Remove from likes if exists
        template.likedBy = template.likedBy.filter(
          (id: any) => id.toString() !== user._id.toString()
        )
        template.likesCount = template.likedBy.length

        if (!template.dislikedBy) template.dislikedBy = []
        template.dislikedBy.push(user._id)
        template.dislikesCount = template.dislikedBy.length
        await template.save()
      }
      return NextResponse.json({
        message: 'Template disliked',
        likesCount: template.likesCount,
        dislikesCount: template.dislikesCount || 0,
        isLiked: false,
        isDisliked: true,
      })
    }

    if (action === 'undislike') {
      template.dislikedBy = template.dislikedBy?.filter(
        (id: any) => id.toString() !== user._id.toString()
      ) || []
      template.dislikesCount = template.dislikedBy.length
      await template.save()
      return NextResponse.json({
        message: 'Template undisliked',
        likesCount: template.likesCount,
        dislikesCount: template.dislikesCount || 0,
        isLiked: false,
        isDisliked: false,
      })
    }

    if (action === 'use') {
      template.usageCount += 1
      await template.save()
      return NextResponse.json({
        message: 'Template usage recorded',
        usageCount: template.usageCount,
        template: {
          id: template._id.toString(),
          name: template.name,
          description: template.description,
          category: template.category,
          icon: template.icon,
          color: template.color,
          tasks: template.tasks.map((task: any) => ({
            title: task.title,
            duration: task.duration,
            priority: task.priority,
          })),
        },
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE - Delete own template or admin delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { templateId } = await params
    await connectToDatabase()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const template = await PublicTemplate.findById(templateId)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Allow author or admin/creator to delete
    const isAuthor = template.author.toString() === user._id.toString()
    const isAdmin = user.isAdmin || user.isCreator

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await PublicTemplate.findByIdAndDelete(templateId)

    return NextResponse.json({
      message: isAdmin && !isAuthor ? 'Template deleted by admin' : 'Template deleted'
    })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
