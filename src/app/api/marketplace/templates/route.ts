import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import { PublicTemplate } from '@/lib/db/models/PublicTemplate'
import User from '@/lib/db/models/User'
import { auth } from '@/auth'

// GET - Fetch public templates (marketplace)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'popular' // popular, recent, mostUsed
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Build query
    const query: any = { isApproved: true }

    if (category && category !== 'all') {
      query.category = category
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ]
    }

    // Build sort
    let sortOption: any = {}
    switch (sort) {
      case 'recent':
        sortOption = { createdAt: -1 }
        break
      case 'mostUsed':
        sortOption = { usageCount: -1 }
        break
      case 'popular':
      default:
        sortOption = { likesCount: -1, usageCount: -1 }
    }

    const skip = (page - 1) * limit

    const [templates, total] = await Promise.all([
      PublicTemplate.find(query)
        .populate('author', 'displayName avatar avatarType')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      PublicTemplate.countDocuments(query),
    ])

    // Get categories with counts
    const categories = await PublicTemplate.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    const transformedTemplates = templates.map((t: any) => ({
      id: t._id.toString(),
      name: t.name,
      description: t.description,
      category: t.category,
      icon: t.icon,
      color: t.color,
      tasks: t.tasks.map((task: any) => ({
        title: task.title,
        duration: task.duration,
        priority: task.priority,
      })),
      author: t.author ? {
        id: t.author._id.toString(),
        displayName: t.author.displayName,
        avatar: t.author.avatar,
        avatarType: t.author.avatarType,
      } : null,
      usageCount: t.usageCount,
      likesCount: t.likesCount,
      tags: t.tags,
      createdAt: t.createdAt,
    }))

    return NextResponse.json({
      templates: transformedTemplates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      categories: categories.map((c: any) => ({
        name: c._id,
        count: c.count,
      })),
    })
  } catch (error) {
    console.error('Error fetching marketplace templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST - Publish a template to marketplace (requires auth)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, category, icon, color, tasks, tags } = body

    if (!name || !category || !tasks || tasks.length === 0) {
      return NextResponse.json(
        { error: 'Name, category, and at least one task are required' },
        { status: 400 }
      )
    }

    const template = new PublicTemplate({
      name,
      description,
      category,
      icon: icon || '📋',
      color: color || 'blue',
      tasks: tasks.map((t: any) => ({
        title: t.title,
        duration: t.duration,
        priority: t.priority || 'medium',
      })),
      author: user._id,
      tags: tags || [],
    })

    await template.save()
    await template.populate('author', 'displayName avatar avatarType')

    return NextResponse.json({
      message: 'Template published successfully',
      template: {
        id: template._id.toString(),
        name: template.name,
        description: template.description,
        category: template.category,
        icon: template.icon,
        color: template.color,
        tasks: template.tasks,
        author: {
          id: user._id.toString(),
          displayName: user.displayName,
          avatar: user.avatar,
          avatarType: user.avatarType,
        },
        usageCount: 0,
        likesCount: 0,
        tags: template.tags,
        createdAt: template.createdAt,
      },
    })
  } catch (error) {
    console.error('Error publishing template:', error)
    return NextResponse.json(
      { error: 'Failed to publish template' },
      { status: 500 }
    )
  }
}
