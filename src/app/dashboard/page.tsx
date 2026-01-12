'use client'

import { useState, useEffect } from 'react'
import { PlusIcon } from '@/components/icons'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { TaskList } from '@/components/dashboard/TaskList'
import { Timeline } from '@/components/dashboard/Timeline'
import { QuickAddModal } from '@/components/dashboard/QuickAddModal'
import { Task } from '@/types'
import { getTasks, saveTasks } from '@/lib/storage/tasks'
import { generateDemoTasks } from '@/lib/storage/demoData'
import { useLanguage } from '@/contexts/LanguageContext'
import { isDemoMode } from '@/lib/demoMode'

export default function DashboardPage() {
  const { t } = useLanguage()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    // Load tasks from localStorage on mount
    let loadedTasks = getTasks()

    // If no tasks exist and in demo mode, load demo data
    if (loadedTasks.length === 0 && isDemoMode()) {
      loadedTasks = generateDemoTasks()
      saveTasks(loadedTasks)
    }

    setTasks(loadedTasks)
  }, [])

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    saveTasks(tasks)
  }, [tasks])

  const handleAddTask = (newTask: Partial<Task>) => {
    const task: Task = {
      id: crypto.randomUUID(),
      ownerId: 'demo-user', // Will be replaced with real auth later
      title: newTask.title || '',
      description: newTask.description,
      // If no start time provided, set it to the selected date at current time
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
      status: 'pending',
      repeatRule: newTask.repeatRule,
      location: newTask.location,
      stepTrigger: newTask.stepTrigger,
      assignees: [],
      tags: newTask.tags || [],
      pomodoroSessions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTasks([...tasks, task])
    setIsAddModalOpen(false)
  }

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ))
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
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
    sum + task.pomodoroSessions.filter(s => s.completed).length, 0
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
