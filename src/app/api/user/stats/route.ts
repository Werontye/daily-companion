import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import Task from '@/lib/db/models/Task'
import { getUserFromToken } from '@/lib/auth/getUserFromToken'
import mongoose from 'mongoose'

/**
 * GET /api/user/stats - Get user statistics
 * Returns task counts, focus sessions, and streak information
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const userId = new mongoose.Types.ObjectId(user.userId)

    // Get total tasks count
    const totalTasks = await Task.countDocuments({ userId })

    // Get completed tasks count
    const completedTasks = await Task.countDocuments({ userId, status: 'completed' })

    // Get tasks completed today
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const tasksCompletedToday = await Task.countDocuments({
      userId,
      status: 'completed',
      completedAt: { $gte: startOfDay, $lte: endOfDay }
    })

    // Calculate current streak
    // For now, simplified - count consecutive days with completed tasks
    let currentStreak = 0
    let checkDate = new Date()
    checkDate.setHours(0, 0, 0, 0)

    // Check today first
    const hasTasksToday = await Task.countDocuments({
      userId,
      status: 'completed',
      completedAt: {
        $gte: checkDate,
        $lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)
      }
    })

    if (hasTasksToday > 0) {
      currentStreak = 1

      // Check previous days
      for (let i = 1; i < 30; i++) {
        checkDate.setDate(checkDate.getDate() - 1)
        const endOfCheckDate = new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)

        const hasTasksOnDay = await Task.countDocuments({
          userId,
          status: 'completed',
          completedAt: {
            $gte: checkDate,
            $lt: endOfCheckDate
          }
        })

        if (hasTasksOnDay > 0) {
          currentStreak++
        } else {
          break
        }
      }
    }

    // Get focus sessions (count of completed pomodoro tasks)
    // For now, just use completed tasks as proxy
    const focusSessions = completedTasks

    return NextResponse.json({
      stats: {
        totalTasks,
        completedTasks,
        tasksCompletedToday,
        focusSessions,
        currentStreak,
      }
    })
  } catch (error) {
    console.error('GET /api/user/stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    )
  }
}
