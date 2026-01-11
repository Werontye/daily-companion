import { NextRequest, NextResponse } from 'next/server'
import { Template } from '@/types'

// In-memory storage (will be replaced with database later)
let templates: Template[] = []

// GET /api/templates - Get all templates for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const userTemplates = templates.filter(t => t.ownerId === userId)

    return NextResponse.json({ templates: userTemplates })
  } catch (error) {
    console.error('GET /api/templates error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, template: templateData } = body

    if (!userId || !templateData) {
      return NextResponse.json(
        { error: 'User ID and template data are required' },
        { status: 400 }
      )
    }

    const newTemplate: Template = {
      id: crypto.randomUUID(),
      ownerId: userId,
      name: templateData.name,
      description: templateData.description,
      tasks: templateData.tasks || [],
      category: templateData.category,
      icon: templateData.icon,
      color: templateData.color,
      isPublic: templateData.isPublic || false,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    templates.push(newTemplate)

    return NextResponse.json({ template: newTemplate }, { status: 201 })
  } catch (error) {
    console.error('POST /api/templates error:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}

// DELETE /api/templates - Delete a template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const templateId = searchParams.get('templateId')

    if (!userId || !templateId) {
      return NextResponse.json(
        { error: 'User ID and template ID are required' },
        { status: 400 }
      )
    }

    const templateIndex = templates.findIndex(
      t => t.id === templateId && t.ownerId === userId
    )

    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    templates.splice(templateIndex, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/templates error:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
