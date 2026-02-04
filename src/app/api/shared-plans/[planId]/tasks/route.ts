import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectToDatabase from '@/lib/db/mongodb'
import { getUserFromRequest } from '@/lib/auth/getUserFromToken'
import SharedPlan from '@/lib/db/models/SharedPlan'

// POST /api/shared-plans/[planId]/tasks - Add task to plan
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
    const { title, description, assignedTo } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
    }

    await connectToDatabase()

    const plan = await SharedPlan.findById(planId)

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check if user can add tasks (owner or editor)
    const isOwner = plan.owner.toString() === user.userId
    const member = plan.members.find((m) => m.userId.toString() === user.userId)
    const canEdit = isOwner || member?.role === 'editor' || member?.role === 'owner'

    if (!canEdit) {
      return NextResponse.json({ error: 'Not authorized to add tasks' }, { status: 403 })
    }

    // Create task
    const newTask = {
      _id: new mongoose.Types.ObjectId(),
      title: title.trim(),
      description: description?.trim() || '',
      assignedTo: assignedTo || undefined,
      status: 'pending' as const,
      createdBy: new mongoose.Types.ObjectId(user.userId),
      createdAt: new Date(),
    }

    plan.tasks.push(newTask)
    await plan.save()

    return NextResponse.json({
      task: {
        id: newTask._id.toString(),
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        assignedTo: newTask.assignedTo?.toString() || null,
        createdBy: user.userId,
        createdAt: newTask.createdAt,
      },
    })
  } catch (error) {
    console.error('Error adding task:', error)
    return NextResponse.json({ error: 'Failed to add task' }, { status: 500 })
  }
}

// PATCH /api/shared-plans/[planId]/tasks - Update task
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
    const { taskId, title, description, status, assignedTo } = body

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    await connectToDatabase()

    const plan = await SharedPlan.findById(planId)

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check if user can edit tasks
    const isOwner = plan.owner.toString() === user.userId
    const member = plan.members.find((m) => m.userId.toString() === user.userId)
    const canEdit = isOwner || member?.role === 'editor' || member?.role === 'owner'

    if (!canEdit) {
      return NextResponse.json({ error: 'Not authorized to edit tasks' }, { status: 403 })
    }

    // Find and update task
    const task = plan.tasks.find((t) => t._id.toString() === taskId)

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (title !== undefined) task.title = title.trim()
    if (description !== undefined) task.description = description?.trim() || ''
    if (status !== undefined) {
      task.status = status
      if (status === 'completed') {
        task.completedAt = new Date()
      } else {
        task.completedAt = undefined
      }
    }
    if (assignedTo !== undefined) {
      task.assignedTo = assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined
    }

    await plan.save()

    return NextResponse.json({
      task: {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        assignedTo: task.assignedTo?.toString() || null,
        completedAt: task.completedAt,
      },
    })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE /api/shared-plans/[planId]/tasks - Delete task
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
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    await connectToDatabase()

    const plan = await SharedPlan.findById(planId)

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check if user can delete tasks
    const isOwner = plan.owner.toString() === user.userId
    const member = plan.members.find((m) => m.userId.toString() === user.userId)
    const canEdit = isOwner || member?.role === 'editor' || member?.role === 'owner'

    if (!canEdit) {
      return NextResponse.json({ error: 'Not authorized to delete tasks' }, { status: 403 })
    }

    // Remove task
    const taskIndex = plan.tasks.findIndex((t) => t._id.toString() === taskId)

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    plan.tasks.splice(taskIndex, 1)
    await plan.save()

    return NextResponse.json({ message: 'Task deleted' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
