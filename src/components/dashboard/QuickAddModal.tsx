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

// Generate hour options (00-23)
const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString().padStart(2, '0'),
  label: i.toString().padStart(2, '0'),
}))

// Generate minute options (00-59 in 5-minute increments)
const minuteOptions = Array.from({ length: 12 }, (_, i) => ({
  value: (i * 5).toString().padStart(2, '0'),
  label: (i * 5).toString().padStart(2, '0'),
}))

export function QuickAddModal({ isOpen, onClose, onSubmit }: QuickAddModalProps) {
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startHour, setStartHour] = useState('')
  const [startMinute, setStartMinute] = useState('')
  const [duration, setDuration] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Combine date and time if both provided
    let combinedStartTime: Date | undefined
    if (startDate && startHour && startMinute) {
      combinedStartTime = new Date(`${startDate}T${startHour}:${startMinute}:00`)
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
    setStartHour('')
    setStartMinute('')
    setDuration('')
    setPriority('medium')
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setStartDate('')
    setStartHour('')
    setStartMinute('')
    setDuration('')
    setPriority('medium')
    onClose()
  }

  // Set default date to today
  const getDefaultDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Quick time presets (hour, minute)
  const timePresets = [
    { label: 'Now', hour: new Date().getHours().toString().padStart(2, '0'), minute: (Math.floor(new Date().getMinutes() / 5) * 5).toString().padStart(2, '0') },
    { label: '09:00', hour: '09', minute: '00' },
    { label: '12:00', hour: '12', minute: '00' },
    { label: '15:00', hour: '15', minute: '00' },
    { label: '18:00', hour: '18', minute: '00' },
    { label: '21:00', hour: '21', minute: '00' },
  ]

  const handlePresetClick = (hour: string, minute: string) => {
    setStartHour(hour)
    setStartMinute(minute)
  }

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

            {/* Time Picker - 24 hour format */}
            <div>
              <label className="label flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-blue-600" />
                Time (24h)
              </label>
              <div className="flex gap-2 items-center">
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="input flex-1"
                >
                  <option value="">HH</option>
                  {hourOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="text-lg font-bold text-neutral-600 dark:text-neutral-400">:</span>
                <select
                  value={startMinute}
                  onChange={(e) => setStartMinute(e.target.value)}
                  className="input flex-1"
                >
                  <option value="">MM</option>
                  {minuteOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
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
                    onClick={() => handlePresetClick(preset.hour, preset.minute)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      startHour === preset.hour && startMinute === preset.minute
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
