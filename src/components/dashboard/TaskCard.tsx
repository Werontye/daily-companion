'use client'

import { Task, TaskStatus } from '@/types'
import {
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  TrashIcon,
  EditIcon,
  PlayIcon
} from '@/components/icons'
import { useState } from 'react'

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onDelete: (taskId: string) => void
  onEdit: (taskId: string) => void
}

export function TaskCard({ task, onStatusChange, onDelete, onEdit }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const priorityColors = {
    low: 'border-l-blue-400',
    medium: 'border-l-yellow-400',
    high: 'border-l-orange-400',
    urgent: 'border-l-red-500',
  }

  const statusColors = {
    pending: 'bg-white dark:bg-neutral-800',
    in_progress: 'bg-blue-50 dark:bg-blue-900/10',
    completed: 'bg-green-50 dark:bg-green-900/10 opacity-75',
    overdue: 'bg-red-50 dark:bg-red-900/10',
    delegated: 'bg-purple-50 dark:bg-purple-900/10',
  }

  const formatTime = (date?: Date) => {
    if (!date) return null
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const handleToggleComplete = () => {
    if (task.status === 'completed') {
      onStatusChange(task.id, 'pending')
    } else {
      onStatusChange(task.id, 'completed')
    }
  }

  return (
    <div
      className={`card border-l-4 ${priorityColors[task.priority]} ${statusColors[task.status]} transition-all duration-200 hover:shadow-lg hover:scale-[1.02] animate-slide-up`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className="flex-shrink-0 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.status === 'completed' ? (
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          ) : (
            <div className="h-6 w-6 rounded-full border-2 border-neutral-300 dark:border-neutral-600 hover:border-blue-500 transition-colors" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-base font-medium ${
              task.status === 'completed'
                ? 'line-through text-neutral-500 dark:text-neutral-400'
                : 'text-neutral-900 dark:text-neutral-100'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {task.description}
            </p>
          )}

          {/* Task Meta Info */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            {task.startTime && (
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                <span>{formatTime(task.startTime)}</span>
                {task.endTime && <span> - {formatTime(task.endTime)}</span>}
              </div>
            )}

            {task.location && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                <span className="truncate max-w-[150px]">{task.location.address}</span>
              </div>
            )}

            {task.pomodoroSessions && task.pomodoroSessions.length > 0 && (
              <div className="flex items-center gap-1">
                <PlayIcon className="h-4 w-4" />
                <span>{task.pomodoroSessions.length} sessions</span>
              </div>
            )}

            {task.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {isHovered && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(task.id)}
              className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Edit task"
            >
              <EditIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Delete task"
            >
              <TrashIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
