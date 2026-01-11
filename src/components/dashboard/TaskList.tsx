'use client'

import { Task, TaskStatus } from '@/types'
import { TaskCard } from './TaskCard'
import { useLanguage } from '@/contexts/LanguageContext'

interface TaskListProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
}

export function TaskList({ tasks, onUpdateTask, onDeleteTask }: TaskListProps) {
  const { t } = useLanguage()

  // Group tasks by status
  const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in_progress')
  const completedTasks = tasks.filter(task => task.status === 'completed')
  const overdueTasks = tasks.filter(task => task.status === 'overdue')

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    onUpdateTask(taskId, { status: newStatus })
  }

  return (
    <div className="space-y-6">
      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 uppercase tracking-wide">
            {t.dashboard.overdue} ({overdueTasks.length})
          </h2>
          <div className="space-y-3">
            {overdueTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={onDeleteTask}
                onEdit={(taskId) => {/* Open edit modal */}}
              />
            ))}
          </div>
        </section>
      )}

      {/* Active Tasks */}
      {pendingTasks.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 uppercase tracking-wide">
            {t.dashboard.tasks} ({pendingTasks.length})
          </h2>
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={onDeleteTask}
                onEdit={(taskId) => {/* Open edit modal */}}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3 uppercase tracking-wide">
            {t.dashboard.completed} ({completedTasks.length})
          </h2>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={onDeleteTask}
                onEdit={(taskId) => {/* Open edit modal */}}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
