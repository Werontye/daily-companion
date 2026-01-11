'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui'
import { Input, TextArea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Task, TaskPriority } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Partial<Task>) => void
}

export function QuickAddModal({ isOpen, onClose, onSubmit }: QuickAddModalProps) {
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const task: Partial<Task> = {
      title,
      description: description || undefined,
      priority,
      startTime: startTime ? new Date(startTime) : undefined,
      duration: duration ? parseInt(duration) : undefined,
      tags: [],
    }

    onSubmit(task)

    // Reset form
    setTitle('')
    setDescription('')
    setStartTime('')
    setDuration('')
    setPriority('medium')
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setStartTime('')
    setDuration('')
    setPriority('medium')
    onClose()
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">{t.task.startTime}</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input"
            />
          </div>

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
