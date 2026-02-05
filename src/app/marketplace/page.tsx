'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon, TemplateIcon } from '@/components/icons'
import { ThemeToggle } from '@/components/ThemeToggle'
import { staggerContainer, staggerItem } from '@/lib/motion'

interface TemplateTask {
  title: string
  duration?: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface MarketplaceTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  color: string
  tasks: TemplateTask[]
  author: {
    id: string
    displayName: string
    avatar: string
    avatarType: string
  } | null
  usageCount: number
  likesCount: number
  dislikesCount: number
  isLiked?: boolean
  isDisliked?: boolean
  tags: string[]
  createdAt: string
}

interface CategoryCount {
  name: string
  count: number
}

const categoryIcons: { [key: string]: string } = {
  work: '💼',
  personal: '🏠',
  health: '💪',
  education: '📚',
  finance: '💰',
  travel: '✈️',
  shopping: '🛒',
  social: '👥',
  creative: '🎨',
  other: '📋',
}

const colorClasses: { [key: string]: string } = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
  cyan: 'from-cyan-500 to-cyan-600',
  red: 'from-red-500 to-red-600',
  yellow: 'from-yellow-500 to-yellow-600',
}

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([])
  const [categories, setCategories] = useState<CategoryCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth')
        if (response.ok) {
          const data = await response.json()
          setIsAuthenticated(!!data.user)
          setIsAdmin(data.user?.isAdmin || data.user?.isCreator || false)
        }
      } catch (error) {
        setIsAuthenticated(false)
        setIsAdmin(false)
      }
    }
    checkAuth()
  }, [])

  const handleLikeDislike = async (templateId: string, action: 'like' | 'unlike' | 'dislike' | 'undislike') => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login'
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/marketplace/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update selected template
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate({
            ...selectedTemplate,
            likesCount: data.likesCount,
            dislikesCount: data.dislikesCount,
            isLiked: data.isLiked,
            isDisliked: data.isDisliked,
          })
        }
        // Update templates list
        setTemplates(templates.map(t =>
          t.id === templateId
            ? { ...t, likesCount: data.likesCount, dislikesCount: data.dislikesCount, isLiked: data.isLiked, isDisliked: data.isDisliked }
            : t
        ))
      }
    } catch (error) {
      console.error('Error with like/dislike:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/marketplace/templates/${templateId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSelectedTemplate(null)
        setTemplates(templates.filter(t => t.id !== templateId))
      }
    } catch (error) {
      console.error('Error deleting template:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort: sortBy,
      })

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/marketplace/templates?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
        setCategories(data.categories)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, selectedCategory, searchQuery, sortBy])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleUseTemplate = async (template: MarketplaceTemplate) => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login'
      return
    }

    try {
      await fetch(`/api/marketplace/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'use' }),
      })

      // Store template data in localStorage for the templates page to use
      const existingTemplates = JSON.parse(localStorage.getItem('daily-companion-templates') || '[]')
      const newTemplate = {
        id: `imported-${Date.now()}`,
        name: template.name,
        description: template.description,
        category: template.category,
        icon: template.icon,
        color: template.color,
        tasks: template.tasks,
        usageCount: 0,
        isPublic: false,
        ownerId: 'current-user',
      }
      localStorage.setItem('daily-companion-templates', JSON.stringify([...existingTemplates, newTemplate]))

      // Redirect to templates page
      window.location.href = '/templates'
    } catch (error) {
      console.error('Error using template:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                <CheckCircleIcon className="h-8 w-8 text-primary-600" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                Daily Companion
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn btn-primary">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="btn btn-ghost hidden sm:inline-flex">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="btn btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-xl shadow-primary-500/25 mb-6"
            >
              <TemplateIcon className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-primary-800 to-slate-900 dark:from-white dark:via-primary-200 dark:to-white bg-clip-text text-transparent mb-4">
              Templates Marketplace
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Discover ready-to-use task templates created by our community. Find the perfect template to boost your productivity.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-4"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => {
                    setSelectedCategory(category.name)
                    setPage(1)
                  }}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedCategory === category.name
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <span>{categoryIcons[category.name] || '📋'}</span>
                  <span className="capitalize">{category.name}</span>
                  <span className="text-xs opacity-70">({category.count})</span>
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Most Recent</option>
              <option value="mostUsed">Most Used</option>
            </select>
          </div>
        </motion.div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 mb-4" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <TemplateIcon className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No templates found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchQuery ? 'Try a different search term' : 'Be the first to share a template!'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {templates.map((template) => (
              <motion.div
                key={template.id}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedTemplate(template)}
              >
                {/* Header */}
                <div className={`h-24 bg-gradient-to-br ${colorClasses[template.color] || colorClasses.blue} p-4 flex items-end`}>
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg">
                    {template.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                    {template.description || 'No description'}
                  </p>

                  {/* Tasks Preview */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700">
                      {template.tasks.length} tasks
                    </span>
                    <span className="capitalize px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700">
                      {template.category}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        {template.likesCount}
                      </span>
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                        </svg>
                        {template.dislikesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {template.usageCount}
                      </span>
                    </div>
                    {template.author && (
                      <div className="flex items-center gap-2">
                        {template.author.avatarType === 'photo' && template.author.avatar ? (
                          <img src={template.author.avatar} alt="" className="w-5 h-5 rounded-full" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-medium">
                            {template.author.avatar || template.author.displayName?.[0]}
                          </div>
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[80px]">
                          {template.author.displayName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-600 dark:text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Template Detail Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className={`h-32 bg-gradient-to-br ${colorClasses[selectedTemplate.color] || colorClasses.blue} p-6 flex items-end relative`}>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-lg">
                  {selectedTemplate.icon}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-128px)]">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {selectedTemplate.name}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {selectedTemplate.description || 'No description provided'}
                </p>

                {/* Author */}
                {selectedTemplate.author && (
                  <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    {selectedTemplate.author.avatarType === 'photo' && selectedTemplate.author.avatar ? (
                      <img src={selectedTemplate.author.avatar} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium">
                        {selectedTemplate.author.avatar || selectedTemplate.author.displayName?.[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {selectedTemplate.author.displayName}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Template Author</div>
                    </div>
                  </div>
                )}

                {/* Tasks */}
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Tasks ({selectedTemplate.tasks.length})
                </h3>
                <div className="space-y-2 mb-6">
                  {selectedTemplate.tasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'urgent' ? 'bg-red-500' :
                        task.priority === 'high' ? 'bg-orange-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <span className="flex-1 text-slate-700 dark:text-slate-300">{task.title}</span>
                      {task.duration && (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {task.duration} min
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Stats and Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => handleLikeDislike(selectedTemplate.id, selectedTemplate.isLiked ? 'unlike' : 'like')}
                    disabled={actionLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedTemplate.isLiked
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={selectedTemplate.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>{selectedTemplate.likesCount}</span>
                  </button>
                  <button
                    onClick={() => handleLikeDislike(selectedTemplate.id, selectedTemplate.isDisliked ? 'undislike' : 'dislike')}
                    disabled={actionLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedTemplate.isDisliked
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={selectedTemplate.isDisliked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    <span>{selectedTemplate.dislikesCount || 0}</span>
                  </button>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{selectedTemplate.usageCount} uses</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUseTemplate(selectedTemplate)}
                      className="flex-1 btn btn-primary"
                    >
                      {isAuthenticated ? 'Use This Template' : 'Sign In to Use'}
                    </button>
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="btn btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                      disabled={actionLoading}
                      className="btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                      {actionLoading ? 'Deleting...' : 'Delete Template (Admin)'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <CheckCircleIcon className="h-6 w-6 text-primary-500" />
            <span className="text-white font-bold">Daily Companion</span>
          </Link>
          <p className="text-sm">Discover and share productivity templates with the community</p>
        </div>
      </footer>
    </div>
  )
}
