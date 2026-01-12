'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui'
import { Input, TextArea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Task, TaskPriority } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { CalendarIcon, ClockIcon } from '@/components/icons'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Partial<Task>) => void
}

export function QuickAddModal({ isOpen, onClose, onSubmit }: QuickAddModalProps) {
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTimeOnly, setStartTimeOnly] = useState('')
  const [duration, setDuration] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Combine date and time if both provided
    let combinedStartTime: Date | undefined
    if (startDate && startTimeOnly) {
      combinedStartTime = new Date(`${startDate}T${startTimeOnly}`)
    } else if (startDate) {
      combinedStartTime = new Date(startDate)
    }

    const task: Partial<Task> = {
      title,
      description: description || undefined,
      priority,
      startTime: combinedStartTime,
      duration: duration ? parseInt(duration) : undefined,
      tags: [],
    }

    onSubmit(task)

    // Reset form
    setTitle('')
    setDescription('')
    setStartDate('')
    setStartTimeOnly('')
    setDuration('')
    setPriority('medium')
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setStartDate('')
    setStartTimeOnly('')
    setDuration('')
    setPriority('medium')
    onClose()
  }

  // Set default date to today
  const getDefaultDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Quick time presets
  const timePresets = [
    { label: 'Now', value: new Date().toTimeString().slice(0, 5) },
    { label: '9:00', value: '09:00' },
    { label: '12:00', value: '12:00' },
    { label: '15:00', value: '15:00' },
    { label: '18:00', value: '18:00' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t.modal.addTask} size="medium">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t.task.title}
          value={title}
          onChange={setTitle}
          placeholder={t.modal.whatToDo}
          required
          autoFocus
        />

        <TextArea
          label={t.task.description}
          value={description}
          onChange={setDescription}
          placeholder={t.modal.addDetails}
          rows={3}
        />

        {/* Date and Time Selection */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div>
              <label className="label flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
                Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
                placeholder={getDefaultDate()}
              />
            </div>

            {/* Time Picker */}
            <div>
              <label className="label flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-blue-600" />
                Time
              </label>
              <input
                type="time"
                value={startTimeOnly}
                onChange={(e) => setStartTimeOnly(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Quick Time Presets */}
          {startDate && (
            <div>
              <label className="label text-xs text-neutral-500 dark:text-neutral-400">
                Quick select time:
              </label>
              <div className="flex flex-wrap gap-2">
                {timePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setStartTimeOnly(preset.value)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      startTimeOnly === preset.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-blue-600 dark:hover:border-blue-600'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duration */}
          <Input
            label={`${t.task.duration} (${t.modal.durationMinutes})`}
            type="number"
            value={duration}
            onChange={setDuration}
            placeholder={t.modal.durationPlaceholder}
          />
        </div>

        <Select
          label={t.task.priority}
          value={priority}
          onChange={(value) => setPriority(value as TaskPriority)}
          options={[
            { value: 'low', label: t.priority.low },
            { value: 'medium', label: t.priority.medium },
            { value: 'high', label: t.priority.high },
            { value: 'urgent', label: t.priority.urgent },
          ]}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            {t.modal.cancel}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!title.trim() || isSubmitting}
            loading={isSubmitting}
            className="flex-1"
          >
            {t.modal.addTaskButton}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
