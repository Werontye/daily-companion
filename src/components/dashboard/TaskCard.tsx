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
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cardVariants, checkmarkVariants, easing } from '@/lib/motion'

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onDelete: (taskId: string) => void
  onEdit: (taskId: string) => void
  index?: number
}

const priorityConfig = {
  low: {
    dot: 'bg-accent-500',
    border: 'border-l-accent-500',
    label: 'Low',
  },
  medium: {
    dot: 'bg-warning',
    border: 'border-l-warning',
    label: 'Medium',
  },
  high: {
    dot: 'bg-orange-500',
    border: 'border-l-orange-500',
    label: 'High',
  },
  urgent: {
    dot: 'bg-danger animate-urgent-pulse',
    border: 'border-l-danger',
    label: 'Urgent',
  },
}

export function TaskCard({ task, onStatusChange, onDelete, onEdit, index = 0 }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const isCompleted = task.status === 'completed'
  const priority = priorityConfig[task.priority]

  const formatTime = useCallback((date?: Date) => {
    if (!date) return null
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }, [])

  const handleToggleComplete = useCallback(async () => {
    setIsCompleting(true)

    // Small delay for animation
    await new Promise(resolve => setTimeout(resolve, 150))

    if (isCompleted) {
      onStatusChange(task.id, 'pending')
    } else {
      onStatusChange(task.id, 'completed')
    }

    setIsCompleting(false)
  }, [isCompleted, onStatusChange, task.id])

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
      custom={index}
      transition={{ delay: index * 0.04 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        relative overflow-hidden rounded-xl border-l-4 ${priority.border}
        bg-white dark:bg-slate-800/80
        shadow-card hover:shadow-lg
        ${isCompleted ? 'opacity-60' : ''}
        ${task.priority === 'urgent' ? 'card-urgent' : ''}
      `}
    >
      {/* Content Container */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {/* Checkbox with animated checkmark */}
          <button
            onClick={handleToggleComplete}
            disabled={isCompleting}
            className="flex-shrink-0 mt-0.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-full"
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            <div className="relative w-6 h-6">
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <CheckCircleIcon className="w-6 h-6 text-success" />
                </motion.div>
              ) : (
                <motion.div
                  className={`
                    w-6 h-6 rounded-full border-2
                    border-slate-300 dark:border-slate-600
                    group-hover:border-primary-500 dark:group-hover:border-primary-400
                    transition-colors duration-fast
                    ${isCompleting ? 'border-primary-500' : ''}
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {/* Animated fill on completing */}
                  <AnimatePresence>
                    {isCompleting && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute inset-1 rounded-full bg-primary-500"
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {/* Title with strikethrough animation */}
            <div className="relative">
              <h3
                className={`
                  text-base font-semibold leading-snug
                  transition-colors duration-medium
                  ${isCompleted
                    ? 'text-slate-400 dark:text-slate-500'
                    : 'text-slate-900 dark:text-slate-100'}
                `}
              >
                {task.title}
              </h3>
              {/* Animated strikethrough */}
              <AnimatePresence>
                {isCompleted && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    exit={{ width: 0 }}
                    transition={{ duration: 0.24, ease: easing.subtle }}
                    className="absolute top-1/2 left-0 h-0.5 bg-slate-400 dark:bg-slate-500"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Description */}
            {task.description && (
              <p className={`
                mt-1.5 text-sm leading-relaxed
                ${isCompleted
                  ? 'text-slate-400 dark:text-slate-500'
                  : 'text-slate-600 dark:text-slate-400'}
              `}>
                {task.description}
              </p>
            )}

            {/* Meta Info Row */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {/* Priority indicator */}
              <div className="flex items-center gap-1.5">
                <span className={`priority-dot ${priority.dot}`} />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {priority.label}
                </span>
              </div>

              {/* Time */}
              {task.startTime && (
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">
                    {formatTime(task.startTime)}
                    {task.endTime && ` - ${formatTime(task.endTime)}`}
                  </span>
                </div>
              )}

              {/* Location */}
              {task.location && (
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <MapPinIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium truncate max-w-[120px]">
                    {task.location.address}
                  </span>
                </div>
              )}

              {/* Pomodoro sessions */}
              {(task.pomodoroSessions?.length ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
                  <PlayIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">
                    {task.pomodoroSessions!.length} sessions
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {task.tags.map((tag, tagIndex) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: tagIndex * 0.05 }}
                    className="badge badge-primary"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1 flex-shrink-0"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEdit(task.id)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  aria-label="Edit task"
                >
                  <EditIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDelete(task.id)}
                  className="p-2 rounded-lg bg-danger-50 dark:bg-danger/10 hover:bg-danger-100 dark:hover:bg-danger/20 transition-colors"
                  aria-label="Delete task"
                >
                  <TrashIcon className="w-4 h-4 text-danger" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hover glow effect for urgent tasks */}
      {task.priority === 'urgent' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.05) 0%, transparent 70%)',
          }}
        />
      )}
    </motion.div>
  )
}

// Compact variant for timeline view
export function TaskCardCompact({ task, onStatusChange }: Pick<TaskCardProps, 'task' | 'onStatusChange'>) {
  const isCompleted = task.status === 'completed'
  const priority = priorityConfig[task.priority]

  const handleToggleComplete = () => {
    onStatusChange(task.id, isCompleted ? 'pending' : 'completed')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      whileHover={{ x: 4 }}
      className={`
        flex items-center gap-3 p-3 rounded-lg
        bg-white dark:bg-slate-800/50
        border border-transparent hover:border-slate-200 dark:hover:border-slate-700
        transition-all duration-fast
        ${isCompleted ? 'opacity-50' : ''}
      `}
    >
      <span className={`priority-dot ${priority.dot}`} />

      <button
        onClick={handleToggleComplete}
        className="flex-shrink-0 focus:outline-none"
      >
        {isCompleted ? (
          <CheckCircleIcon className="w-5 h-5 text-success" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-primary-500 transition-colors" />
        )}
      </button>

      <span className={`
        flex-1 text-sm font-medium truncate
        ${isCompleted ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}
      `}>
        {task.title}
      </span>
    </motion.div>
  )
}
