'use client'

import { useState } from 'react'
import { Task } from '@/types'
import { CalendarIcon } from '@/components/icons'
import { useLanguage } from '@/contexts/LanguageContext'

interface TimelineProps {
  tasks: Task[]
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function Timeline({ tasks, selectedDate, onDateChange }: TimelineProps) {
  const { t } = useLanguage()
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [calendarDate, setCalendarDate] = useState(new Date(selectedDate))
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getTasksForHour = (hour: number) => {
    return tasks.filter(task => {
      if (!task.startTime) return false
      const taskHour = new Date(task.startTime).getHours()
      return taskHour === hour
    })
  }

  const handleDateChange = (newDate: Date) => {
    setIsAnimating(true)
    setTimeout(() => {
      onDateChange(newDate)
      setTimeout(() => setIsAnimating(false), 300)
    }, 150)
  }

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    handleDateChange(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    handleDateChange(newDate)
  }

  const goToToday = () => {
    handleDateChange(new Date())
  }

  const goToDate = (date: Date) => {
    handleDateChange(date)
    setShowDatePicker(false)
  }

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  // Navigate calendar month
  const goToPreviousMonth = () => {
    const newDate = new Date(calendarDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCalendarDate(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(calendarDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCalendarDate(newDate)
  }

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    // Add empty cells for days before the first day of month
    const firstDayOfWeek = firstDay.getDay()
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  return (
    <div className="card h-full relative">
      {/* Date Selector */}
      <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {t.timeline.title}
          </h2>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Open calendar"
          >
            <CalendarIcon className="h-5 w-5 text-blue-600" />
          </button>
        </div>

        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={goToPreviousDay}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Previous day"
            >
              ←
            </button>

            <div className="text-center">
              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
            </div>

            <button
              onClick={goToNextDay}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Next day"
            >
              →
            </button>
          </div>
        </div>

        {!isToday && (
          <button
            onClick={goToToday}
            className="w-full mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t.timeline.goToToday}
          </button>
        )}
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="absolute top-20 left-0 right-0 z-50 card shadow-2xl animate-slide-down">
          {/* Month/Year Navigation */}
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Previous month"
            >
              ←
            </button>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Next month"
            >
              →
            </button>
            <button
              onClick={() => setShowDatePicker(false)}
              className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center font-semibold text-neutral-500 py-1">
                {day}
              </div>
            ))}
            {generateCalendarDays().map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} className="p-2" />
              }
              const isSelected = day.toDateString() === selectedDate.toDateString()
              const isTodayDate = day.toDateString() === new Date().toDateString()
              return (
                <button
                  key={i}
                  onClick={() => goToDate(day)}
                  className={`p-2 rounded-lg text-center transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : isTodayDate
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Hourly Timeline */}
      <div className={`space-y-1 overflow-y-auto max-h-[calc(100vh-20rem)] transition-all duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {hours.map(hour => {
          const hourTasks = getTasksForHour(hour)
          const currentHour = new Date().getHours()
          const isCurrentHour = isToday && hour === currentHour

          return (
            <div
              key={hour}
              className={`flex gap-2 py-2 px-2 rounded-lg transition-colors ${
                isCurrentHour ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex-shrink-0 w-12 text-sm text-neutral-500 dark:text-neutral-400">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="flex-1 min-w-0">
                {hourTasks.length > 0 ? (
                  <div className="space-y-1">
                    {hourTasks.map(task => (
                      <div
                        key={task.id}
                        className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 rounded truncate"
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-4 border-l-2 border-neutral-200 dark:border-neutral-700" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
