'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { TrophyIcon, CheckCircleIcon, ClockIcon } from '@/components/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, staggerItem, achievementUnlockVariants, glowRingVariants } from '@/lib/motion'

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
  productivity: {
    name: 'Productivity',
    gradient: 'from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20',
    border: 'border-primary-200/50 dark:border-primary-800/50',
    iconBg: 'bg-primary-600',
    textColor: 'text-primary-600',
    progressBg: 'bg-primary-600',
  },
  consistency: {
    name: 'Consistency',
    gradient: 'from-success-50 to-emerald-100 dark:from-success/20 dark:to-emerald-800/20',
    border: 'border-success-200/50 dark:border-success/30',
    iconBg: 'bg-success',
    textColor: 'text-success-600 dark:text-success',
    progressBg: 'bg-success',
  },
  milestones: {
    name: 'Milestones',
    gradient: 'from-accent-50 to-cyan-100 dark:from-accent-900/30 dark:to-cyan-800/20',
    border: 'border-accent-200/50 dark:border-accent-800/50',
    iconBg: 'bg-accent-500',
    textColor: 'text-accent-600 dark:text-accent-400',
    progressBg: 'bg-accent-500',
  },
  social: {
    name: 'Social',
    gradient: 'from-warning-50 to-orange-100 dark:from-warning/20 dark:to-orange-800/20',
    border: 'border-warning-200/50 dark:border-warning/30',
    iconBg: 'bg-warning',
    textColor: 'text-warning-600 dark:text-warning',
    progressBg: 'bg-warning',
  },
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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
  const progressPercent = achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0

  const filteredAchievements = selectedCategory
    ? achievements.filter(a => a.category === selectedCategory)
    : achievements

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
            Achievements
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Track your progress and unlock rewards
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <motion.div
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(79, 70, 229, 0.3)' }}
            className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 border border-primary-200/50 dark:border-primary-800/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Unlocked
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
                <TrophyIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <motion.div
              key={unlockedCount}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-primary-600 mb-2"
            >
              {unlockedCount}/{achievements.length}
            </motion.div>
            <div className="w-full bg-primary-200/50 dark:bg-primary-900/50 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="bg-primary-600 h-full rounded-full"
              />
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(6, 182, 212, 0.3)' }}
            className="card bg-gradient-to-br from-accent-50 to-cyan-100 dark:from-accent-900/30 dark:to-cyan-800/20 border border-accent-200/50 dark:border-accent-800/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Points
              </div>
              <div className="w-10 h-10 rounded-xl bg-accent-500 flex items-center justify-center shadow-lg shadow-accent-500/30">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-accent-600 dark:text-accent-400">
              {totalPoints}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              100 points per achievement
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(245, 158, 11, 0.3)' }}
            className="card bg-gradient-to-br from-warning-50 to-orange-100 dark:from-warning/20 dark:to-orange-800/20 border border-warning-200/50 dark:border-warning/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Current Streak
              </div>
              <div className="w-10 h-10 rounded-xl bg-warning flex items-center justify-center shadow-lg shadow-warning/30">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold text-warning-600 dark:text-warning flex items-center gap-1">
              {currentStreak}
              {currentStreak > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  🔥
                </motion.span>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Days in a row
            </div>
          </motion.div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-8 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg shadow-primary-600/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All
          </motion.button>
          {Object.entries(categories).map(([key, category]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedCategory === key
                  ? `bg-gradient-to-br ${category.gradient} ${category.border} border shadow-lg`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Achievements Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton h-40 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredAchievements.map((achievement, idx) => {
                const category = categories[achievement.category]

                return (
                  <motion.div
                    key={achievement.id}
                    variants={staggerItem}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{
                      y: -4,
                      boxShadow: achievement.unlocked
                        ? '0 20px 40px -15px rgba(79, 70, 229, 0.3)'
                        : '0 10px 30px -15px rgba(15, 23, 42, 0.2)',
                    }}
                    className={`card relative overflow-hidden ${
                      achievement.unlocked
                        ? `bg-gradient-to-br ${category.gradient} ${category.border} border`
                        : 'bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'
                    } transition-all cursor-pointer group`}
                  >
                    {/* Unlock glow effect */}
                    {achievement.unlocked && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'radial-gradient(ellipse at center, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
                        }}
                      />
                    )}

                    <div className="flex items-start gap-4 relative z-10">
                      {/* Achievement Icon */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`relative flex-shrink-0 ${
                          !achievement.unlocked && 'grayscale opacity-40'
                        }`}
                      >
                        <span className="text-5xl">{achievement.icon}</span>
                        {achievement.unlocked && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center shadow-lg"
                          >
                            <CheckCircleIcon className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold mb-1 ${
                          achievement.unlocked
                            ? 'text-slate-900 dark:text-slate-100'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {achievement.name}
                        </h3>
                        <p className={`text-sm mb-3 line-clamp-2 ${
                          achievement.unlocked
                            ? 'text-slate-600 dark:text-slate-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {achievement.description}
                        </p>

                        {achievement.unlocked ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2"
                          >
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${category.textColor}`}>
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              Unlocked
                            </span>
                            {achievement.unlockedAt && (
                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                          </motion.div>
                        ) : (
                          <div>
                            {achievement.progress !== undefined && achievement.maxProgress !== undefined ? (
                              <>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Progress
                                  </span>
                                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                    {achievement.progress}/{achievement.maxProgress}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                                    }}
                                    transition={{ delay: idx * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    className="bg-slate-400 dark:bg-slate-500 h-full rounded-full"
                                  />
                                </div>
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                Locked
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium ${
                      achievement.unlocked
                        ? `${category.iconBg} text-white`
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {category.name}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAchievements.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center">
              <TrophyIcon className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No achievements in this category
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Keep completing tasks to unlock achievements!
            </p>
          </motion.div>
        )}

        {/* Motivation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 card bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200/50 dark:border-primary-800/50"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-600/30 flex-shrink-0">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Keep Going!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {unlockedCount === 0
                  ? "Start completing tasks to unlock your first achievement. Every journey begins with a single step!"
                  : unlockedCount < achievements.length / 2
                  ? `You've unlocked ${unlockedCount} achievements so far. You're making great progress - keep it up!`
                  : unlockedCount < achievements.length
                  ? `Amazing! You've unlocked ${unlockedCount} out of ${achievements.length} achievements. You're almost there!`
                  : "Incredible! You've unlocked all achievements. You're a true productivity champion! 🏆"
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
