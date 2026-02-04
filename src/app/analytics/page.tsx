'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ChartBarIcon, ClockIcon, CheckCircleIcon, TrophyIcon } from '@/components/icons'
import { Task } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, staggerItem, chartBarVariants } from '@/lib/motion'

interface DailyData {
  day: string
  completed: number
  total: number
}

interface Stats {
  tasksCompleted: number
  tasksTotal: number
  pomodoroSessions: number
  focusHours: number
  productivityScore: number
  dailyData: DailyData[]
}

// Empty initial stats
const emptyStats: Stats = {
  tasksCompleted: 0,
  tasksTotal: 0,
  pomodoroSessions: 0,
  focusHours: 0,
  productivityScore: 0,
  dailyData: [],
}

const initialStats = {
  week: { ...emptyStats },
  month: { ...emptyStats },
  year: { ...emptyStats },
}

interface TaskCategory {
  name: string
  count: number
  color: string
}

interface PeakHour {
  time: string
  tasks: number
  percentage: number
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<{
    week: Stats
    month: Stats
    year: Stats
  }>(initialStats)
  const [taskDistribution, setTaskDistribution] = useState<TaskCategory[]>([])
  const [peakHours, setPeakHours] = useState<PeakHour[]>([])

  useEffect(() => {
    // Load tasks from API and calculate statistics
    const loadAndCalculateStatistics = async () => {
      setIsLoading(true)

      try {
        const response = await fetch('/api/tasks')
        if (!response.ok) {
          console.error('Failed to load tasks')
          setIsLoading(false)
          return
        }

        const data = await response.json()
        const tasks: Task[] = data.tasks || []

        // If no tasks, show empty stats
        if (tasks.length === 0) {
          setStats(initialStats)
          setTaskDistribution([])
          setPeakHours([])
          setIsLoading(false)
          return
        }

        const now = new Date()

      // Helper function to get date range
      const getDateRange = (range: 'week' | 'month' | 'year') => {
        const start = new Date(now)
        if (range === 'week') {
          start.setDate(now.getDate() - 7)
        } else if (range === 'month') {
          start.setDate(now.getDate() - 30)
        } else {
          start.setDate(now.getDate() - 365)
        }
        return start
      }

      // Calculate stats for each time range
      const calculateRangeStats = (range: 'week' | 'month' | 'year'): Stats => {
        const startDate = getDateRange(range)
        const rangeTasks = tasks.filter(t => {
          if (!t.startTime) return false
          const taskDate = new Date(t.startTime)
          return taskDate >= startDate && taskDate <= now
        })

        const completed = rangeTasks.filter(t => t.status === 'completed').length
        const total = rangeTasks.length

        // Calculate productivity score (0-100 based on completion rate and consistency)
        const completionRate = total > 0 ? (completed / total) * 100 : 0
        const productivityScore = Math.min(100, Math.round(completionRate))

        // Calculate daily/weekly/monthly data based on range
        const dailyData: DailyData[] = []
        if (range === 'week') {
          // For week: show last 7 days
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(now.getDate() - i)
            const dateStr = date.toDateString()

            const dayTasks = rangeTasks.filter(t =>
              t.startTime && new Date(t.startTime).toDateString() === dateStr
            )
            const dayCompleted = dayTasks.filter(t => t.status === 'completed').length

            dailyData.push({
              day: days[date.getDay()],
              completed: dayCompleted,
              total: dayTasks.length,
            })
          }
        } else if (range === 'month') {
          // For month: show last 4 weeks
          for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(now)
            weekStart.setDate(now.getDate() - (i * 7) - 6)
            const weekEnd = new Date(now)
            weekEnd.setDate(now.getDate() - (i * 7))

            const weekTasks = rangeTasks.filter(t => {
              if (!t.startTime) return false
              const taskDate = new Date(t.startTime)
              return taskDate >= weekStart && taskDate <= weekEnd
            })
            const weekCompleted = weekTasks.filter(t => t.status === 'completed').length

            dailyData.push({
              day: `W${4 - i}`,
              completed: weekCompleted,
              total: weekTasks.length,
            })
          }
        } else if (range === 'year') {
          // For year: show last 12 months
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          for (let i = 11; i >= 0; i--) {
            const monthDate = new Date(now)
            monthDate.setMonth(now.getMonth() - i)
            const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

            const monthTasks = rangeTasks.filter(t => {
              if (!t.startTime) return false
              const taskDate = new Date(t.startTime)
              return taskDate >= monthStart && taskDate <= monthEnd
            })
            const monthCompleted = monthTasks.filter(t => t.status === 'completed').length

            dailyData.push({
              day: months[monthDate.getMonth()],
              completed: monthCompleted,
              total: monthTasks.length,
            })
          }
        }

        return {
          tasksCompleted: completed,
          tasksTotal: total,
          pomodoroSessions: 0, // Not tracked yet
          focusHours: 0, // Not tracked yet
          productivityScore,
          dailyData,
        }
      }

      setStats({
        week: calculateRangeStats('week'),
        month: calculateRangeStats('month'),
        year: calculateRangeStats('year'),
      })

      // Calculate task distribution by tags
      const tagCounts: { [key: string]: number } = {}
      const colors = [
        'bg-primary-600',
        'bg-accent-500',
        'bg-success',
        'bg-warning',
        'bg-purple-600',
        'bg-pink-500'
      ]

      tasks.forEach(task => {
        if (task.tags && task.tags.length > 0) {
          task.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        }
      })

      const distribution = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count], index) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count,
          color: colors[index] || 'bg-slate-500'
        }))

      setTaskDistribution(distribution.length > 0 ? distribution : [])

      // Calculate peak productivity hours
      const hourCounts: { [key: number]: number } = {}
      const hourCompleted: { [key: number]: number } = {}

      tasks.forEach(task => {
        if (task.startTime) {
          const hour = new Date(task.startTime).getHours()
          hourCounts[hour] = (hourCounts[hour] || 0) + 1
          if (task.status === 'completed') {
            hourCompleted[hour] = (hourCompleted[hour] || 0) + 1
          }
        }
      })

      // Group into 2-hour blocks and find top 3
      const timeBlocks: { [key: string]: { total: number, completed: number } } = {}

      for (let i = 0; i < 24; i += 2) {
        const blockKey = `${i}-${i + 2}`
        const total = (hourCounts[i] || 0) + (hourCounts[i + 1] || 0)
        const completed = (hourCompleted[i] || 0) + (hourCompleted[i + 1] || 0)
        if (total > 0) {
          timeBlocks[blockKey] = { total, completed }
        }
      }

      const topBlocks = Object.entries(timeBlocks)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 3)
        .map(([time, data]) => ({
          time,
          tasks: data.total,
          percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
        }))

      setPeakHours(topBlocks.length > 0 ? topBlocks : [])
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAndCalculateStatistics()
  }, [])

  const currentStats = stats[timeRange]
  const completionRate = currentStats.tasksTotal > 0
    ? Math.round((currentStats.tasksCompleted / currentStats.tasksTotal) * 100)
    : 0

  const maxTasks = Math.max(...currentStats.dailyData.map(d => d.total), 1)

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                Analytics
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Track your productivity trends and insights
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {(['week', 'month', 'year'] as const).map(range => (
                <motion.button
                  key={range}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTimeRange(range)}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    timeRange === range
                      ? 'text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {timeRange === range && (
                    <motion.div
                      layoutId="active-range"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary-600 to-accent-500 shadow-lg"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{range}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <motion.div
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(79, 70, 229, 0.3)' }}
            className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 border border-primary-200/50 dark:border-primary-800/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Completion Rate
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
                <CheckCircleIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <motion.div
              key={completionRate}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-primary-600 mb-1"
            >
              {completionRate}%
            </motion.div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {currentStats.tasksCompleted} of {currentStats.tasksTotal} tasks
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(6, 182, 212, 0.3)' }}
            className="card bg-gradient-to-br from-accent-50 to-cyan-100 dark:from-accent-900/30 dark:to-cyan-800/20 border border-accent-200/50 dark:border-accent-800/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Pomodoro Sessions
              </div>
              <div className="w-10 h-10 rounded-xl bg-accent-500 flex items-center justify-center shadow-lg shadow-accent-500/30">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold text-accent-600 dark:text-accent-400 mb-1">
              {currentStats.pomodoroSessions}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Focus sessions completed
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(245, 158, 11, 0.3)' }}
            className="card bg-gradient-to-br from-warning-50 to-orange-100 dark:from-warning/20 dark:to-orange-800/20 border border-warning-200/50 dark:border-warning/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Focus Time
              </div>
              <div className="w-10 h-10 rounded-xl bg-warning flex items-center justify-center shadow-lg shadow-warning/30">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold text-warning-600 dark:text-warning mb-1">
              {currentStats.focusHours}h
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Deep work hours
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(16, 185, 129, 0.3)' }}
            className="card bg-gradient-to-br from-success-50 to-emerald-100 dark:from-success/20 dark:to-emerald-800/20 border border-success-200/50 dark:border-success/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Productivity Score
              </div>
              <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center shadow-lg shadow-success/30">
                <TrophyIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold text-success-600 dark:text-success mb-1">
              {currentStats.productivityScore}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Out of 100
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dynamic Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-primary-600" />
              {timeRange === 'week' ? 'Daily Task Completion' : timeRange === 'month' ? 'Weekly Task Completion' : 'Monthly Task Completion'}
            </h3>

            {currentStats.dailyData.length > 0 ? (
              <div className="flex items-end justify-between gap-2 sm:gap-4 h-64">
                <AnimatePresence mode="wait">
                  {currentStats.dailyData.map((day, idx) => {
                    const percentage = day.total > 0 ? (day.completed / day.total) * 100 : 0
                    const heightPercent = day.total > 0 ? (day.total / maxTasks) * 100 : 10

                    return (
                      <motion.div
                        key={`${timeRange}-${day.day}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div className="relative w-full flex-1 flex flex-col justify-end group">
                          {/* Background bar */}
                          <div className="absolute bottom-0 w-full bg-slate-100 dark:bg-slate-700/50 rounded-xl" style={{ height: `${heightPercent}%` }} />

                          {/* Completed bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(percentage / 100) * heightPercent}%` }}
                            transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="relative w-full bg-gradient-to-t from-primary-600 to-accent-500 rounded-xl shadow-lg shadow-primary-600/20"
                          />

                          {/* Tooltip */}
                          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-10 shadow-xl">
                            {day.completed}/{day.total} tasks
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                          {day.day}
                        </div>
                        <div className={`text-xs font-semibold ${percentage >= 80 ? 'text-success' : percentage >= 50 ? 'text-warning' : 'text-slate-400'}`}>
                          {day.total > 0 ? Math.round(percentage) : 0}%
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
                No data available for this period
              </div>
            )}
          </motion.div>

          {/* Task Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Task Distribution
            </h3>
            {taskDistribution.length > 0 ? (
              <div className="space-y-4">
                {taskDistribution.map((category, idx) => {
                  const totalTasks = taskDistribution.reduce((sum, c) => sum + c.count, 0)
                  const percentage = Math.round((category.count / totalTasks) * 100)

                  return (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${category.color}`} />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {category.name}
                          </span>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {category.count} tasks
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: idx * 0.1 + 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full rounded-full ${category.color}`}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <ChartBarIcon className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No categories yet
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                  Add tags to your tasks!
                </p>
              </div>
            )}
          </motion.div>

          {/* Best Time of Day */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Peak Productivity Hours
            </h3>
            {peakHours.length > 0 ? (
              <div className="space-y-4">
                {peakHours.map((slot, idx) => (
                  <motion.div
                    key={slot.time}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-success' : idx === 1 ? 'bg-warning' : 'bg-accent-500'}`} />
                        {slot.time}:00
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {slot.tasks} tasks · {slot.percentage}% done
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${slot.percentage}%` }}
                        transition={{ delay: idx * 0.1 + 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className={`h-full rounded-full ${idx === 0 ? 'bg-success' : idx === 1 ? 'bg-warning' : 'bg-accent-500'}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <ClockIcon className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No productivity data yet
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                  Complete some tasks!
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 card bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200/50 dark:border-primary-800/50"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-xl">💡</span>
            Insights & Recommendations
          </h3>
          <ul className="space-y-3">
            {[
              'Your most productive time is between 09:00-11:00. Schedule important tasks during this window.',
              `You completed ${completionRate}% of tasks this ${timeRange}. ${completionRate >= 80 ? 'Excellent work!' : completionRate >= 50 ? 'Keep it up!' : 'Try to improve this pace.'}`,
              'Consider taking more breaks - your productivity increases by 15% after a proper rest.',
            ].map((insight, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary-600" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">{insight}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
