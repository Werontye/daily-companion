import { Task } from '@/types'

const TASKS_STORAGE_KEY = 'daily-companion-tasks'

export function getTasks(): Task[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY)
    if (!stored) return []

    const tasks = JSON.parse(stored)

    // Convert date strings back to Date objects
    return tasks.map((task: any) => ({
      ...task,
      startTime: task.startTime ? new Date(task.startTime) : undefined,
      endTime: task.endTime ? new Date(task.endTime) : undefined,
      createdAt: task.createdAt ? new Date(task.createdAt) : undefined,
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
      pomodoroSessions: task.pomodoroSessions?.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
      })) || [],
    }))
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error)
    return []
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    console.error('Error saving tasks to localStorage:', error)
  }
}

export function getTaskById(id: string): Task | null {
  const tasks = getTasks()
  return tasks.find(task => task.id === id) || null
}

export function addTask(task: Task): void {
  const tasks = getTasks()
  saveTasks([...tasks, task])
}

export function updateTask(id: string, updates: Partial<Task>): void {
  const tasks = getTasks()
  const updatedTasks = tasks.map(task =>
    task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
  )
  saveTasks(updatedTasks)
}

export function deleteTask(id: string): void {
  const tasks = getTasks()
  saveTasks(tasks.filter(task => task.id !== id))
}

export function clearAllTasks(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TASKS_STORAGE_KEY)
}

// Get tasks for a specific date
export function getTasksForDate(date: Date): Task[] {
  const tasks = getTasks()
  return tasks.filter(task => {
    if (!task.startTime) return false
    const taskDate = new Date(task.startTime)
    return (
      taskDate.getDate() === date.getDate() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getFullYear() === date.getFullYear()
    )
  })
}

// Get overdue tasks
export function getOverdueTasks(): Task[] {
  const tasks = getTasks()
  const now = new Date()

  return tasks.filter(task => {
    if (!task.endTime || task.status === 'completed') return false
    return new Date(task.endTime) < now
  })
}

// Get upcoming tasks (next 7 days)
export function getUpcomingTasks(days: number = 7): Task[] {
  const tasks = getTasks()
  const now = new Date()
  const future = new Date()
  future.setDate(future.getDate() + days)

  return tasks.filter(task => {
    if (!task.startTime) return false
    const taskDate = new Date(task.startTime)
    return taskDate >= now && taskDate <= future
  })
}
