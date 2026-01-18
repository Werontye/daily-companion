'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
  category: 'productivity' | 'consistency' | 'milestones' | 'social'
}

const categories = {
  productivity: { name: 'Productivity', color: 'blue' },
  consistency: { name: 'Consistency', color: 'green' },
  milestones: { name: 'Milestones', color: 'purple' },
  social: { name: 'Social', color: 'orange' },
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentStreak, setCurrentStreak] = useState(0)

  useEffect(() => {
    // Load achievements from API
    const loadAchievements = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/achievements')
        if (response.ok) {
          const data = await response.json()
          setAchievements(data.achievements || [])
        } else {
          console.error('Failed to load achievements')
        }
      } catch (error) {
        console.error('Error loading achievements:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Load user stats for streak
    const loadStats = async () => {
      try {
        const response = await fetch('/api/user/stats')
        if (response.ok) {
          const data = await response.json()
          setCurrentStreak(data.stats?.currentStreak || 0)
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    loadAchievements()
    loadStats()
  }, [])

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalPoints = unlockedCount * 100

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            Achievements
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Track your progress and unlock rewards
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Unlocked Achievements
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-1">
              {unlockedCount}/{achievements.length}
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Total Points
            </div>
            <div className="text-4xl font-bold text-purple-600">
              {totalPoints}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              100 points per achievement
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Current Streak
            </div>
            <div className="text-4xl font-bold text-orange-600">
              {currentStreak}{currentStreak > 0 ? '🔥' : ''}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Days in a row
            </div>
          </div>
        </div>

        {/* Achievements by Category */}
        {Object.entries(categories).map(([key, category]) => {
          const categoryAchievements = achievements.filter(a => a.category === key)
          const unlockedInCategory = categoryAchievements.filter(a => a.unlocked).length

          return (
            <div key={key} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {category.name}
                </h2>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {unlockedInCategory}/{categoryAchievements.length} unlocked
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`card ${
                      achievement.unlocked
                        ? `bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 dark:from-${category.color}-900/20 dark:to-${category.color}-800/20 border border-${category.color}-200 dark:border-${category.color}-800`
                        : 'bg-neutral-100 dark:bg-neutral-800 opacity-60'
                    } transition-all hover-lift`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`text-5xl ${
                          !achievement.unlocked && 'grayscale opacity-40'
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          {achievement.description}
                        </p>

                        {achievement.unlocked ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                              ✓ Unlocked
                            </span>
                            {achievement.unlockedAt && (
                              <span className="text-xs text-neutral-500">
                                {achievement.unlockedAt.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            {achievement.progress !== undefined && achievement.maxProgress !== undefined ? (
                              <>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                    Progress
                                  </span>
                                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                    {achievement.progress}/{achievement.maxProgress}
                                  </span>
                                </div>
                                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                                  <div
                                    className="bg-neutral-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${
                                        (achievement.progress / achievement.maxProgress) * 100
                                      }%`,
                                    }}
                                  />
                                </div>
                              </>
                            ) : (
                              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                🔒 Locked
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
