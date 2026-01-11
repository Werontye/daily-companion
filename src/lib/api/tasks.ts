import { Task } from '@/types'

const API_BASE = '/api'

/**
 * Fetch all tasks for a user, optionally filtered by date
 */
export async function fetchTasks(userId: string, date?: Date): Promise<Task[]> {
  const params = new URLSearchParams({ userId })
  if (date) {
    params.append('date', date.toISOString())
  }

  const response = await fetch(`${API_BASE}/tasks?${params}`)
  if (!response.ok) {
    throw new Error('Failed to fetch tasks')
  }

  const data = await response.json()
  return data.tasks.map((task: any) => ({
    ...task,
    startTime: task.startTime ? new Date(task.startTime) : undefined,
    endTime: task.endTime ? new Date(task.endTime) : undefined,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  }))
}

/**
 * Create a new task
 */
export async function createTask(userId: string, task: Partial<Task>): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, task }),
  })

  if (!response.ok) {
    throw new Error('Failed to create task')
  }

  const data = await response.json()
  return {
    ...data.task,
    startTime: data.task.startTime ? new Date(data.task.startTime) : undefined,
    endTime: data.task.endTime ? new Date(data.task.endTime) : undefined,
    createdAt: new Date(data.task.createdAt),
    updatedAt: new Date(data.task.updatedAt),
  }
}

/**
 * Update an existing task
 */
export async function updateTask(
  userId: string,
  taskId: string,
  updates: Partial<Task>
): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, taskId, updates }),
  })

  if (!response.ok) {
    throw new Error('Failed to update task')
  }

  const data = await response.json()
  return {
    ...data.task,
    startTime: data.task.startTime ? new Date(data.task.startTime) : undefined,
    endTime: data.task.endTime ? new Date(data.task.endTime) : undefined,
    createdAt: new Date(data.task.createdAt),
    updatedAt: new Date(data.task.updatedAt),
  }
}

/**
 * Delete a task
 */
export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const params = new URLSearchParams({ userId, taskId })
  const response = await fetch(`${API_BASE}/tasks?${params}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete task')
  }
}
