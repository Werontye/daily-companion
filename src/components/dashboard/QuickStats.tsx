'use client'

import { PlayIcon, TrophyIcon, CheckCircleIcon } from '@/components/icons'
import Link from 'next/link'

interface QuickStatsProps {
  completedToday: number
  totalTasks: number
  pomodoroSessions: number
  onStartPomodoro: () => void
}

export function QuickStats({
  completedToday,
  totalTasks,
  pomodoroSessions,
  onStartPomodoro
}: QuickStatsProps) {
  const completionRate = totalTasks > 0
    ? Math.round((completedToday / totalTasks) * 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Quick Stats Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Today&apos;s Progress
        </h2>

        <div className="space-y-4">
          {/* Completion Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Completion Rate
              </span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {completionRate}%
              </span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  Completed
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {completedToday}
              </div>
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <PlayIcon className="h-4 w-4 text-orange-600" />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  Pomodoros
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {pomodoroSessions}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pomodoro Quick Start */}
      <div className="card bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <h3 className="text-lg font-semibold mb-2">Ready to Focus?</h3>
        <p className="text-sm text-white/90 mb-4">
          Start a 25-minute Pomodoro session
        </p>
        <Link
          href="/pomodoro"
          className="block w-full py-2 px-4 bg-white text-orange-600 rounded-lg font-medium text-center hover:bg-orange-50 transition-colors"
        >
          <PlayIcon className="h-5 w-5 inline mr-2" />
          Start Pomodoro
        </Link>
      </div>

      {/* Achievements Preview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Achievements
          </h2>
          <TrophyIcon className="h-5 w-5 text-yellow-500" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <span className="text-xl">🔥</span>
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                3 Day Streak
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Keep it up!
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Early Bird
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                5 tasks before 09:00
              </div>
            </div>
          </div>

          <Link
            href="/achievements"
            className="block text-sm text-blue-600 dark:text-blue-400 hover:underline text-center pt-2"
          >
            View all achievements →
          </Link>
        </div>
      </div>
    </div>
  )
}
