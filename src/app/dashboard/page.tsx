'use client'

import { useState, useEffect } from 'react'
import { PlusIcon } from '@/components/icons'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { TaskList } from '@/components/dashboard/TaskList'
import { Timeline } from '@/components/dashboard/Timeline'
import { QuickAddModal } from '@/components/dashboard/QuickAddModal'
import { Task } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DashboardPage() {
  const { t } = useLanguage()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

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
        const data = await response.json()
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

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto py-8">
        {/* Left Column - Timeline (Desktop only) */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <Timeline
              tasks={todayTasks}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        </div>

        {/* Center Column - Task List */}
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {t.dashboard.title}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary hidden lg:flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              {t.dashboard.addTask}
            </button>
          </div>

          <TaskList
            tasks={todayTasks}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />

          {todayTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                {t.dashboard.noTasks}
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                {t.dashboard.createTask}
              </button>
            </div>
          )}

          {/* Quick Stats - Inline at bottom */}
          {todayTasks.length > 0 && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Progress</div>
                <div className="text-3xl font-bold text-blue-600">{completedToday}/{todayTasks.length}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0}% complete
                </div>
              </div>
              <div className="card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Pomodoros</div>
                <div className="text-3xl font-bold text-orange-600">{totalPomodoros}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">sessions completed</div>
              </div>
              <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Streak</div>
                <div className="text-3xl font-bold text-green-600">3🔥</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">days in a row</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (Mobile only) */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center transition-all z-40"
        aria-label="Add task"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </DashboardLayout>
  )
}
