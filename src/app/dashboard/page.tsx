'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, CheckCircleIcon, ClockIcon, TrophyIcon } from '@/components/icons'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { TaskList } from '@/components/dashboard/TaskList'
import { Timeline } from '@/components/dashboard/Timeline'
import { QuickAddModal } from '@/components/dashboard/QuickAddModal'
import { Task } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, staggerItem, fadeUp, numberCountVariants } from '@/lib/motion'

export default function DashboardPage() {
  const { t } = useLanguage()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState('User')
  const [streak, setStreak] = useState(0)

  // Load tasks from API
  const loadTasks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      } else {
        console.error('Failed to load tasks:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load user data
  const loadUserData = async () => {
    try {
      const response = await fetch('/api/auth')
      if (response.ok) {
        const data = await response.json()
        if (data.user?.displayName) {
          setUserName(data.user.displayName)
        }
      }

      // Load stats for streak
      const statsResponse = await fetch('/api/user/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStreak(statsData.stats?.currentStreak || 0)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  // Check achievements based on user progress
  const checkAchievements = async () => {
    try {
      // Get user stats
      const statsResponse = await fetch('/api/user/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        const { completedTasks, currentStreak } = statsData.stats

        // Check achievements
        await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completedTasks, currentStreak }),
        })
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  }

  useEffect(() => {
    loadTasks()
    loadUserData()
  }, [])

  const handleAddTask = async (newTask: Partial<Task>) => {
    try {
      const taskData = {
        title: newTask.title || '',
        description: newTask.description,
        startTime: newTask.startTime || new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          new Date().getHours(),
          new Date().getMinutes()
        ),
        endTime: newTask.endTime,
        duration: newTask.duration,
        priority: newTask.priority || 'medium',
        tags: newTask.tags || [],
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        // Reload tasks to get updated list
        await loadTasks()
        // Check for new achievements
        await checkAchievements()
        setIsAddModalOpen(false)
      } else {
        console.error('Failed to create task:', response.statusText)
        alert('Failed to create task. Please try again.')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task. Please try again.')
    }
  }

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId, ...updates }),
      })

      if (response.ok) {
        // Reload tasks to get updated list
        await loadTasks()
        // Check for new achievements when marking task as completed
        if (updates.status === 'completed') {
          await checkAchievements()
        }
      } else {
        console.error('Failed to update task:', response.statusText)
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Reload tasks to get updated list
        await loadTasks()
      } else {
        console.error('Failed to delete task:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const todayTasks = tasks.filter(task => {
    if (!task.startTime) return task.status === 'pending'
    const taskDate = new Date(task.startTime)
    return (
      taskDate.getDate() === selectedDate.getDate() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getFullYear() === selectedDate.getFullYear()
    )
  })

  const completedToday = todayTasks.filter(t => t.status === 'completed').length
  const totalPomodoros = tasks.reduce((sum, task) =>
    sum + (task.pomodoroSessions?.filter(s => s.completed).length || 0), 0
  )
  const progressPercent = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section with Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 p-8 md:p-10">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-accent-500/20 blur-3xl" />
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-10 right-10 w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm"
              />
              <motion.div
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-10 right-32 w-12 h-12 rounded-xl bg-white/5 backdrop-blur-sm"
              />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mb-2"
              >
                <span className="text-white/80 text-sm font-medium">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {streak > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">
                    {streak} day streak
                  </span>
                )}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold text-white mb-2"
              >
                {getGreeting()}, {userName.split(' ')[0]}!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/70 text-lg mb-6"
              >
                {todayTasks.length === 0
                  ? "You have a clear schedule today. Ready to add some tasks?"
                  : completedToday === todayTasks.length
                  ? "Amazing! You've completed all your tasks!"
                  : `You have ${todayTasks.length - completedToday} task${todayTasks.length - completedToday === 1 ? '' : 's'} remaining today.`
                }
              </motion.p>

              {/* Progress Bar */}
              {todayTasks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                    <span>Daily Progress</span>
                    <span>{completedToday} of {todayTasks.length} completed</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <motion.div
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(79, 70, 229, 0.3)' }}
            className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-0.5">Progress</div>
                <motion.div
                  variants={numberCountVariants}
                  className="text-3xl font-bold text-primary-600"
                >
                  {completedToday}/{todayTasks.length}
                </motion.div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {progressPercent}% complete
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(245, 158, 11, 0.3)' }}
            className="card bg-gradient-to-br from-warning-50 to-orange-100 dark:from-warning/20 dark:to-orange-800/20 border border-warning-200 dark:border-warning/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-warning flex items-center justify-center shadow-lg shadow-warning/30">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-0.5">Focus Time</div>
                <motion.div
                  variants={numberCountVariants}
                  className="text-3xl font-bold text-warning-600 dark:text-warning"
                >
                  {totalPomodoros}
                </motion.div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  pomodoro sessions
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(16, 185, 129, 0.3)' }}
            className="card bg-gradient-to-br from-success-50 to-emerald-100 dark:from-success/20 dark:to-emerald-800/20 border border-success-200 dark:border-success/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-success flex items-center justify-center shadow-lg shadow-success/30">
                <TrophyIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-0.5">Streak</div>
                <motion.div
                  variants={numberCountVariants}
                  className="text-3xl font-bold text-success-600 dark:text-success"
                >
                  {streak}
                </motion.div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  days in a row
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Timeline (Desktop only) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="sticky top-24">
              <Timeline
                tasks={todayTasks}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </div>
          </motion.div>

          {/* Center Column - Task List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {t.dashboard.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                  Manage your tasks for today
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary hidden lg:flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                {t.dashboard.addTask}
              </motion.button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-24 rounded-xl" />
                ))}
              </div>
            ) : (
              <>
                <TaskList
                  tasks={todayTasks}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                />

                <AnimatePresence>
                  {todayTasks.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-16"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center"
                      >
                        <CheckCircleIcon className="w-10 h-10 text-primary-600" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        No tasks for today
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                        {t.dashboard.noTasks}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        <PlusIcon className="h-5 w-5" />
                        {t.dashboard.createTask}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Floating Action Button (Mobile only) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAddModalOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-500 text-white rounded-2xl shadow-lg shadow-primary-600/40 hover:shadow-xl hover:shadow-primary-600/50 flex items-center justify-center transition-shadow z-40"
        aria-label="Add task"
      >
        <PlusIcon className="h-6 w-6" />
      </motion.button>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </DashboardLayout>
  )
}
