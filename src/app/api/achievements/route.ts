import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import Achievement from '@/lib/db/models/Achievement'
import Notification from '@/lib/db/models/Notification'
import { getUserFromRequest } from '@/lib/auth/getUserFromToken'
import mongoose from 'mongoose'

// Define default achievements
const DEFAULT_ACHIEVEMENTS = [
  {
    achievementId: 'first-task',
    name: 'First Steps',
    description: 'Complete your first task',
    icon: '🎯',
    category: 'milestones' as const,
    maxProgress: 1,
  },
  {
    achievementId: 'task-10',
    name: 'Getting Started',
    description: 'Complete 10 tasks',
    icon: '⭐',
    category: 'productivity' as const,
    maxProgress: 10,
  },
  {
    achievementId: 'task-50',
    name: 'Productive',
    description: 'Complete 50 tasks',
    icon: '🚀',
    category: 'productivity' as const,
    maxProgress: 50,
  },
  {
    achievementId: 'task-100',
    name: 'Task Master',
    description: 'Complete 100 tasks',
    icon: '👑',
    category: 'productivity' as const,
    maxProgress: 100,
  },
  {
    achievementId: 'streak-3',
    name: 'Consistent',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'consistency' as const,
    maxProgress: 3,
  },
  {
    achievementId: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '💪',
    category: 'consistency' as const,
    maxProgress: 7,
  },
  {
    achievementId: 'streak-30',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '🏆',
    category: 'consistency' as const,
    maxProgress: 30,
  },
]

/**
 * GET /api/achievements - Get user achievements
 */
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

    const userId = new mongoose.Types.ObjectId(user.userId)

    // Get user achievements
    let achievements = await Achievement.find({ userId })

    // If no achievements exist, create default ones
    if (achievements.length === 0) {
      const defaultAchievements = DEFAULT_ACHIEVEMENTS.map(ach => ({
        userId,
        ...ach,
        progress: 0,
        unlocked: false,
      }))

      achievements = await Achievement.insertMany(defaultAchievements)
    }

    return NextResponse.json({
      achievements: achievements.map(ach => ({
        id: ach._id.toString(),
        achievementId: ach.achievementId,
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        category: ach.category,
        unlocked: ach.unlocked,
        unlockedAt: ach.unlockedAt,
        progress: ach.progress,
        maxProgress: ach.maxProgress,
      }))
    })
  } catch (error) {
    console.error('GET /api/achievements error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/achievements/check - Check and unlock achievements based on user progress
 */
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

    const userId = new mongoose.Types.ObjectId(user.userId)
    const body = await request.json()
    const { completedTasks, currentStreak } = body

    // Get all user achievements
    const achievements = await Achievement.find({ userId })

    const newlyUnlocked = []

    // Check task-based achievements
    for (const achievement of achievements) {
      if (achievement.unlocked) continue

      let shouldUnlock = false
      let newProgress = achievement.progress

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
      achievement.progress = newProgress

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

    return NextResponse.json({
      checked: true,
      newlyUnlocked: newlyUnlocked.map(ach => ({
        id: ach._id.toString(),
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
      }))
    })
  } catch (error) {
    console.error('POST /api/achievements/check error:', error)
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    )
  }
}
