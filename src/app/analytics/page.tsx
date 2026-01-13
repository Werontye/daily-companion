'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ChartBarIcon, ClockIcon, CheckCircleIcon } from '@/components/icons'
import { getTasks } from '@/lib/storage/tasks'
import { isDemoMode } from '@/lib/demoMode'

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

// Demo data for demo mode
const demoStats = {
  week: {
    tasksCompleted: 42,
    tasksTotal: 58,
    pomodoroSessions: 24,
    focusHours: 10.5,
    productivityScore: 72,
    dailyData: [
      { day: 'Mon', completed: 8, total: 10 },
      { day: 'Tue', completed: 6, total: 9 },
      { day: 'Wed', completed: 7, total: 8 },
      { day: 'Thu', completed: 5, total: 10 },
      { day: 'Fri', completed: 9, total: 12 },
      { day: 'Sat', completed: 4, total: 5 },
      { day: 'Sun', completed: 3, total: 4 },
    ],
  },
  month: {
    tasksCompleted: 168,
    tasksTotal: 245,
    pomodoroSessions: 96,
    focusHours: 42,
    productivityScore: 69,
    dailyData: [
      { day: 'W1', completed: 38, total: 58 },
      { day: 'W2', completed: 42, total: 62 },
      { day: 'W3', completed: 45, total: 64 },
      { day: 'W4', completed: 43, total: 61 },
    ],
  },
  year: {
    tasksCompleted: 1842,
    tasksTotal: 2654,
    pomodoroSessions: 1152,
    focusHours: 480,
    productivityScore: 71,
    dailyData: [
      { day: 'Jan', completed: 142, total: 218 },
      { day: 'Feb', completed: 138, total: 205 },
      { day: 'Mar', completed: 156, total: 228 },
      { day: 'Apr', completed: 148, total: 215 },
      { day: 'May', completed: 162, total: 232 },
      { day: 'Jun', completed: 154, total: 224 },
      { day: 'Jul', completed: 158, total: 226 },
      { day: 'Aug', completed: 152, total: 220 },
      { day: 'Sep', completed: 146, total: 212 },
      { day: 'Oct', completed: 160, total: 230 },
      { day: 'Nov', completed: 164, total: 234 },
      { day: 'Dec', completed: 162, total: 210 },
    ],
  },
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
  const [animatedBars, setAnimatedBars] = useState(false)
  const [stats, setStats] = useState<{
    week: Stats
    month: Stats
    year: Stats
  }>(demoStats)
  const [taskDistribution, setTaskDistribution] = useState<TaskCategory[]>([])
  const [peakHours, setPeakHours] = useState<PeakHour[]>([])

  useEffect(() => {
    // Trigger animation on mount and when timeRange changes
    setAnimatedBars(false)
    const timer = setTimeout(() => setAnimatedBars(true), 100)
    return () => clearTimeout(timer)
  }, [timeRange])

  useEffect(() => {
    // Calculate statistics from localStorage
    const calculateStatistics = () => {
      const tasks = getTasks()

      // If no tasks and not in demo mode, return empty stats
      if (tasks.length === 0 && !isDemoMode()) {
        const emptyStats = {
          tasksCompleted: 0,
          tasksTotal: 0,
          pomodoroSessions: 0,
          focusHours: 0,
          productivityScore: 0,
          dailyData: [] as DailyData[],
        }
        setStats({
          week: emptyStats,
          month: emptyStats,
          year: emptyStats,
        })
        setTaskDistribution([])
        setPeakHours([])
        return
      }

      // If in demo mode and no tasks, use demo data
      if (tasks.length === 0 && isDemoMode()) {
        setStats(demoStats)
        setTaskDistribution([
          { name: 'Work', count: 24, color: 'bg-blue-600' },
          { name: 'Personal', count: 12, color: 'bg-purple-600' },
          { name: 'Health', count: 8, color: 'bg-green-600' },
          { name: 'Learning', count: 6, color: 'bg-orange-600' },
        ])
        setPeakHours([
          { time: '9-11', tasks: 18, percentage: 85 },
          { time: '14-16', tasks: 14, percentage: 72 },
          { time: '19-21', tasks: 10, percentage: 58 },
        ])
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
      const colors = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-600', 'bg-pink-600', 'bg-indigo-600']

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
          color: colors[index] || 'bg-gray-600'
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
    }

    calculateStatistics()
  }, [])

  const currentStats = stats[timeRange]
  const completionRate = currentStats.tasksTotal > 0
    ? Math.round((currentStats.tasksCompleted / currentStats.tasksTotal) * 100)
    : 0

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                Analytics
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                Track your productivity trends and insights
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    timeRange === range
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Completion Rate
              </div>
              <CheckCircleIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-1">
              {completionRate}%
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              {currentStats.tasksCompleted} of {currentStats.tasksTotal} tasks
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Pomodoro Sessions
              </div>
              <ClockIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-4xl font-bold text-purple-600 mb-1">
              {currentStats.pomodoroSessions}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              Focus sessions completed
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Focus Time
              </div>
              <ClockIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-4xl font-bold text-orange-600 mb-1">
              {currentStats.focusHours}h
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              Deep work hours
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Productivity Score
              </div>
              <ChartBarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-4xl font-bold text-green-600 mb-1">
              {currentStats.productivityScore}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              Out of 100
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dynamic Progress Chart - Shows days/weeks/months based on timeRange */}
          {currentStats.dailyData.length > 0 && (
            <div className="card lg:col-span-2">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                {timeRange === 'week' ? 'Daily Task Completion' : timeRange === 'month' ? 'Weekly Task Completion' : 'Monthly Task Completion'}
              </h3>
              <div className="flex items-end justify-between gap-4 h-64">
                {currentStats.dailyData.map((day, idx) => {
                  const percentage = day.total > 0 ? (day.completed / day.total) * 100 : 0
                  const height = animatedBars ? percentage : 0
                  return (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full flex-1 flex flex-col justify-end">
                        {/* Completed bar */}
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg transition-all duration-1000 ease-out relative group"
                          style={{
                            height: `${height}%`,
                            transitionDelay: `${idx * 100}ms`
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {day.completed}/{day.total}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {day.day}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {day.total > 0 ? Math.round(percentage) : 0}%
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Task Categories */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Task Distribution
            </h3>
            {taskDistribution.length > 0 ? (
              <div className="space-y-3">
                {taskDistribution.map(category => (
                  <div key={category.name} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-300">
                      {category.name}
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-500 dark:text-neutral-400 text-sm">
                No task categories yet. Add tags to your tasks!
              </div>
            )}
          </div>

          {/* Best Time of Day */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Peak Productivity Hours
            </h3>
            {peakHours.length > 0 ? (
              <div className="space-y-3">
                {peakHours.map(slot => (
                  <div key={slot.time}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {slot.time}:00
                      </span>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {slot.tasks} tasks
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${slot.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-500 dark:text-neutral-400 text-sm">
                No productivity data yet. Complete some tasks!
              </div>
            )}
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
            💡 Insights & Recommendations
          </h3>
          <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Your most productive time is between 9-11 AM. Schedule important tasks during this window.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>You completed {completionRate}% of tasks this {timeRange}. Great work! Try to maintain this pace.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Consider taking more breaks - your productivity increases by 15% after a proper rest.</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
