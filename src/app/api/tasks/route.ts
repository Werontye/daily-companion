import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import Task from '@/lib/db/models/Task'
import Achievement from '@/lib/db/models/Achievement'
import Notification from '@/lib/db/models/Notification'
import { getUserFromRequest } from '@/lib/auth/getUserFromToken'
import mongoose from 'mongoose'

// Helper function to check and unlock achievements
async function checkAchievements(userId: mongoose.Types.ObjectId) {
  try {
    // Count completed tasks
    const completedTasks = await Task.countDocuments({
      userId,
      status: 'completed'
    })

    // Calculate current streak (simplified - days with at least one completed task)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let currentStreak = 0
    let checkDate = new Date(today)

    // Check backwards from today
    for (let i = 0; i < 365; i++) {
      const startOfDay = new Date(checkDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(checkDate)
      endOfDay.setHours(23, 59, 59, 999)

      const hasCompletedTask = await Task.findOne({
        userId,
        status: 'completed',
        completedAt: { $gte: startOfDay, $lte: endOfDay }
      })

      if (hasCompletedTask) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (i === 0) {
        // If today has no completed tasks, check yesterday
        checkDate.setDate(checkDate.getDate() - 1)
        continue
      } else {
        break
      }
    }

    // Get all user achievements
    const achievements = await Achievement.find({ userId })

    const newlyUnlocked = []

    // Check each achievement
    for (const achievement of achievements) {
      if (achievement.unlocked) continue

      let shouldUnlock = false
      let newProgress = achievement.progress

      // First task achievement
      if (achievement.achievementId === 'first-task') {
        newProgress = completedTasks
        if (completedTasks >= 1) {
          shouldUnlock = true
        }
      }

      // Task completion achievements
      if (achievement.achievementId.startsWith('task-')) {
        newProgress = completedTasks
        if (completedTasks >= achievement.maxProgress) {
          shouldUnlock = true
        }
      }

      // Streak achievements
      if (achievement.achievementId.startsWith('streak-')) {
        newProgress = currentStreak
        if (currentStreak >= achievement.maxProgress) {
          shouldUnlock = true
        }
      }

      // Update progress
      achievement.progress = Math.min(newProgress, achievement.maxProgress)

      // Unlock if criteria met
      if (shouldUnlock) {
        achievement.unlocked = true
        achievement.unlockedAt = new Date()
        newlyUnlocked.push(achievement)

        // Create notification
        await Notification.create({
          userId,
          title: `Achievement Unlocked! ${achievement.icon}`,
          message: `You've unlocked "${achievement.name}": ${achievement.description}`,
          type: 'achievement',
          relatedId: achievement._id.toString(),
          read: false,
        })
      }

      await achievement.save()
    }

    return newlyUnlocked
  } catch (error) {
    console.error('Error checking achievements:', error)
    return []
  }
}

// GET /api/tasks - Get all tasks for a user
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const status = searchParams.get('status')

    // Build query
    const query: any = { userId: new mongoose.Types.ObjectId(user.userId) }

    // Filter by date if provided
    if (date) {
      const targetDate = new Date(date)
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

      query.startTime = {
        $gte: startOfDay,
        $lte: endOfDay,
      }
    }

    // Filter by status if provided
    if (status) {
      query.status = status
    }

    const tasks = await Task.find(query).sort({ startTime: 1, createdAt: -1 })

    return NextResponse.json({
      tasks: tasks.map(task => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        tags: task.tags,
        startTime: task.startTime,
        endTime: task.endTime,
        duration: task.duration,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }))
    })
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
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const body = await request.json()
    const { title, description, priority, tags, startTime, endTime, duration } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const newTask = await Task.create({
      userId: new mongoose.Types.ObjectId(user.userId),
      title,
      description,
      status: 'pending',
      priority: priority || 'medium',
      tags: tags || [],
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      duration,
    })

    return NextResponse.json(
      {
        task: {
          id: newTask._id.toString(),
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          priority: newTask.priority,
          tags: newTask.tags,
          startTime: newTask.startTime,
          endTime: newTask.endTime,
          duration: newTask.duration,
          createdAt: newTask.createdAt,
          updatedAt: newTask.updatedAt,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

// PATCH /api/tasks - Update a task
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
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Find task and verify ownership
    const task = await Task.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(user.userId),
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if task is being completed
    const wasCompleted = task.status === 'completed'
    const isNowCompleted = updates.status === 'completed'

    // Update task
    Object.assign(task, updates)

    // Set completedAt when task is marked as completed
    if (!wasCompleted && isNowCompleted) {
      task.completedAt = new Date()
    }

    await task.save()

    // Check achievements if task was just completed
    let unlockedAchievements: any[] = []
    if (!wasCompleted && isNowCompleted) {
      unlockedAchievements = await checkAchievements(new mongoose.Types.ObjectId(user.userId))
    }

    return NextResponse.json({
      task: {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        tags: task.tags,
        startTime: task.startTime,
        endTime: task.endTime,
        duration: task.duration,
        completedAt: task.completedAt,
        updatedAt: task.updatedAt,
      },
      unlockedAchievements: unlockedAchievements.map(a => ({
        id: a._id.toString(),
        name: a.name,
        description: a.description,
        icon: a.icon,
      }))
    })
  } catch (error) {
    console.error('PATCH /api/tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Find and delete task, verifying ownership
    const result = await Task.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(user.userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
