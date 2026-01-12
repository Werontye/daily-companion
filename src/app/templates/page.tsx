'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { PlusIcon, ClockIcon, CheckCircleIcon, XIcon } from '@/components/icons'
import { Toast } from '@/components/ui/toast/Toast'
import { getTemplates, saveTemplates } from '@/lib/storage/templates'
import { isDemoMode } from '@/lib/demoMode'

interface TemplateItem {
  id: string
  name: string
  description: string
  category: string
  icon: string
  color: string
  tasks: Array<{
    title: string
    duration?: number
    priority: 'low' | 'medium' | 'high' | 'urgent'
  }>
  usageCount: number
  isPublic: boolean
  ownerId: string
}

const demoTemplates: TemplateItem[] = [
  {
    id: '1',
    name: 'Morning Routine',
    description: 'Start your day with a productive morning routine',
    category: 'Personal',
    icon: '☀️',
    color: 'orange',
    tasks: [
      { title: 'Morning meditation', duration: 10, priority: 'medium' },
      { title: 'Workout', duration: 30, priority: 'high' },
      { title: 'Healthy breakfast', duration: 20, priority: 'medium' },
      { title: 'Review daily goals', duration: 15, priority: 'high' },
    ],
    usageCount: 24,
    isPublic: true,
    ownerId: 'demo-user',
  },
  {
    id: '2',
    name: 'Deep Work Session',
    description: '4-hour focused work block with breaks',
    category: 'Work',
    icon: '💼',
    color: 'blue',
    tasks: [
      { title: 'Pomodoro 1 (25min)', duration: 25, priority: 'urgent' },
      { title: 'Short break', duration: 5, priority: 'low' },
      { title: 'Pomodoro 2 (25min)', duration: 25, priority: 'urgent' },
      { title: 'Short break', duration: 5, priority: 'low' },
      { title: 'Pomodoro 3 (25min)', duration: 25, priority: 'urgent' },
      { title: 'Long break', duration: 15, priority: 'low' },
    ],
    usageCount: 42,
    isPublic: true,
    ownerId: 'demo-user',
  },
  {
    id: '3',
    name: 'Weekly Review',
    description: 'Reflect on the week and plan ahead',
    category: 'Planning',
    icon: '📊',
    color: 'purple',
    tasks: [
      { title: 'Review completed tasks', duration: 20, priority: 'high' },
      { title: 'Analyze time spent', duration: 15, priority: 'medium' },
      { title: 'Set next week goals', duration: 25, priority: 'high' },
      { title: 'Schedule important meetings', duration: 15, priority: 'medium' },
    ],
    usageCount: 18,
    isPublic: true,
    ownerId: 'demo-user',
  },
  {
    id: '4',
    name: 'Learning Session',
    description: 'Structured learning with practice',
    category: 'Education',
    icon: '📚',
    color: 'green',
    tasks: [
      { title: 'Watch tutorial/lecture', duration: 45, priority: 'high' },
      { title: 'Take notes', duration: 15, priority: 'medium' },
      { title: 'Practice exercises', duration: 30, priority: 'high' },
      { title: 'Review and summarize', duration: 15, priority: 'medium' },
    ],
    usageCount: 31,
    isPublic: true,
    ownerId: 'demo-user',
  },
]

const colorClasses = {
  orange: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800',
  blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800',
  purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800',
  green: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800',
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'Personal',
    icon: '📝',
    color: 'blue' as keyof typeof colorClasses,
    isPublic: false,
    tasks: [{ title: '', duration: 15, priority: 'medium' as const }]
  })

  // Load templates from localStorage on mount
  useEffect(() => {
    let loadedTemplates = getTemplates()

    // If no templates exist and in demo mode, load demo data
    if (loadedTemplates.length === 0 && isDemoMode()) {
      loadedTemplates = demoTemplates
      saveTemplates(loadedTemplates)
    }

    setTemplates(loadedTemplates)
  }, [])

  // Save templates to localStorage whenever they change
  useEffect(() => {
    if (templates.length > 0) {
      saveTemplates(templates)
    }
  }, [templates])

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))]

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory)

  const handleUseTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    setToast({ message: `Template "${template?.name}" applied to today's tasks!`, type: 'success' })
    setTemplates(templates.map(t =>
      t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
    ))
  }

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim()) {
      setToast({ message: 'Template name is required', type: 'error' })
      return
    }

    if (newTemplate.tasks.length === 0 || !newTemplate.tasks[0].title.trim()) {
      setToast({ message: 'At least one task is required', type: 'error' })
      return
    }

    const template: TemplateItem = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category,
      icon: newTemplate.icon,
      color: newTemplate.color,
      tasks: newTemplate.tasks.filter(t => t.title.trim()),
      usageCount: 0,
      isPublic: newTemplate.isPublic,
      ownerId: 'current-user'
    }

    setTemplates([...templates, template])
    setShowCreateModal(false)
    setToast({ message: `Template "${template.name}" created successfully!`, type: 'success' })

    // Reset form
    setNewTemplate({
      name: '',
      description: '',
      category: 'Personal',
      icon: '📝',
      color: 'blue',
      isPublic: false,
      tasks: [{ title: '', duration: 15, priority: 'medium' }]
    })
  }

  const addTask = () => {
    setNewTemplate({
      ...newTemplate,
      tasks: [...newTemplate.tasks, { title: '', duration: 15, priority: 'medium' }]
    })
  }

  const removeTask = (index: number) => {
    setNewTemplate({
      ...newTemplate,
      tasks: newTemplate.tasks.filter((_, i) => i !== index)
    })
  }

  const updateTask = (index: number, field: string, value: any) => {
    const updatedTasks = [...newTemplate.tasks]
    updatedTasks[index] = { ...updatedTasks[index], [field]: value }
    setNewTemplate({ ...newTemplate, tasks: updatedTasks })
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                Templates
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                Save time with pre-built task templates
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Create Template
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className={`card bg-gradient-to-br ${colorClasses[template.color as keyof typeof colorClasses]} border hover-lift`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{template.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      {template.name}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {template.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tasks Preview */}
              <div className="space-y-2 mb-4">
                {template.tasks.slice(0, 3).map((task, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <CheckCircleIcon className="h-4 w-4 text-neutral-400" />
                    <span className="flex-1">{task.title}</span>
                    {task.duration && (
                      <span className="flex items-center gap-1 text-xs text-neutral-500">
                        <ClockIcon className="h-3 w-3" />
                        {task.duration}m
                      </span>
                    )}
                  </div>
                ))}
                {template.tasks.length > 3 && (
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 ml-6">
                    +{template.tasks.length - 3} more tasks
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Used {template.usageCount} times
                </div>
                <button
                  onClick={() => handleUseTemplate(template.id)}
                  className="btn btn-primary btn-sm"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              No templates found in this category
            </p>
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Create New Template
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <XIcon className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="label">Template Name *</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="input"
                    placeholder="e.g., Morning Routine"
                    required
                  />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    className="input min-h-[80px]"
                    placeholder="Briefly describe this template..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Category</label>
                    <select
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                      className="input"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Work">Work</option>
                      <option value="Planning">Planning</option>
                      <option value="Education">Education</option>
                      <option value="Health">Health</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Icon</label>
                    <input
                      type="text"
                      value={newTemplate.icon}
                      onChange={(e) => setNewTemplate({ ...newTemplate, icon: e.target.value })}
                      className="input"
                      placeholder="📝"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Color Theme</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(colorClasses) as Array<keyof typeof colorClasses>).map(color => (
                      <button
                        key={color}
                        onClick={() => setNewTemplate({ ...newTemplate, color })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          newTemplate.color === color
                            ? 'border-blue-600 scale-105'
                            : 'border-neutral-300 dark:border-neutral-600'
                        } bg-gradient-to-br ${colorClasses[color]}`}
                      >
                        <span className="capitalize text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {color}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newTemplate.isPublic}
                    onChange={(e) => setNewTemplate({ ...newTemplate, isPublic: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-600"
                  />
                  <label htmlFor="isPublic" className="text-sm text-neutral-700 dark:text-neutral-300">
                    Make this template public (other users can use it)
                  </label>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="label mb-0">Tasks *</label>
                  <button
                    onClick={addTask}
                    className="btn btn-ghost btn-sm flex items-center gap-1"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Task
                  </button>
                </div>

                <div className="space-y-3">
                  {newTemplate.tasks.map((task, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => updateTask(index, 'title', e.target.value)}
                          className="input"
                          placeholder="Task title"
                          required
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="number"
                              value={task.duration}
                              onChange={(e) => updateTask(index, 'duration', parseInt(e.target.value) || 0)}
                              className="input"
                              placeholder="Duration (min)"
                              min="1"
                            />
                          </div>
                          <select
                            value={task.priority}
                            onChange={(e) => updateTask(index, 'priority', e.target.value)}
                            className="input"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                      {newTemplate.tasks.length > 1 && (
                        <button
                          onClick={() => removeTask(index)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors mt-1"
                        >
                          <XIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  className="btn btn-primary flex-1"
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  )
}
