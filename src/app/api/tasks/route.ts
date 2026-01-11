import { NextRequest, NextResponse } from 'next/server'
import { Task } from '@/types'

// In-memory storage (will be replaced with database later)
let tasks: Task[] = []

// GET /api/tasks - Get all tasks for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let filteredTasks = tasks.filter(task => task.ownerId === userId)

    // Filter by date if provided
    if (date) {
      const targetDate = new Date(date)
      filteredTasks = filteredTasks.filter(task => {
        if (!task.startTime) return false
        const taskDate = new Date(task.startTime)
        return (
          taskDate.getDate() === targetDate.getDate() &&
          taskDate.getMonth() === targetDate.getMonth() &&
          taskDate.getFullYear() === targetDate.getFullYear()
        )
      })
    }

    return NextResponse.json({ tasks: filteredTasks })
  } catch (error) {
    console.error('GET /api/tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, task: taskData } = body

    if (!userId || !taskData) {
      return NextResponse.json(
        { error: 'User ID and task data are required' },
        { status: 400 }
      )
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      ownerId: userId,
      title: taskData.title,
      description: taskData.description,
      startTime: taskData.startTime ? new Date(taskData.startTime) : undefined,
      endTime: taskData.endTime ? new Date(taskData.endTime) : undefined,
      duration: taskData.duration,
      priority: taskData.priority || 'medium',
      status: taskData.status || 'pending',
      repeatRule: taskData.repeatRule,
      location: taskData.location,
      stepTrigger: taskData.stepTrigger,
      assignees: taskData.assignees || [],
      tags: taskData.tags || [],
      pomodoroSessions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    tasks.push(newTask)

    return NextResponse.json({ task: newTask }, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

// PUT /api/tasks - Update a task
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, taskId, updates } = body

    if (!userId || !taskId || !updates) {
      return NextResponse.json(
        { error: 'User ID, task ID, and updates are required' },
        { status: 400 }
      )
    }

    const taskIndex = tasks.findIndex(
      task => task.id === taskId && task.ownerId === userId
    )

    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    }

    return NextResponse.json({ task: tasks[taskIndex] })
  } catch (error) {
    console.error('PUT /api/tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const taskId = searchParams.get('taskId')

    if (!userId || !taskId) {
      return NextResponse.json(
        { error: 'User ID and task ID are required' },
        { status: 400 }
      )
    }

    const taskIndex = tasks.findIndex(
      task => task.id === taskId && task.ownerId === userId
    )

    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    tasks.splice(taskIndex, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
