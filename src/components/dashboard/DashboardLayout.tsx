'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  TemplateIcon,
  UserGroupIcon,
  SettingsIcon,
  TrophyIcon,
  CheckCircleIcon,
  MenuIcon,
  XIcon,
  BellIcon
} from '@/components/icons'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'

interface Notification {
  id: string
  title: string
  message: string
  time: Date
  read: boolean
  type: 'achievement' | 'task' | 'system'
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [recentAchievements, setRecentAchievements] = useState<any[]>([])
  const [userName, setUserName] = useState('User')
  const [userInitial, setUserInitial] = useState('U')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [userAvatarType, setUserAvatarType] = useState<'initial' | 'photo'>('initial')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [userStats, setUserStats] = useState({ totalTasks: 0, focusSessions: 0, currentStreak: 0 })

  const navigation = [
    { name: 'Today', href: '/dashboard', icon: CalendarIcon },
    { name: 'Pomodoro', href: '/pomodoro', icon: ClockIcon },
    { name: 'Templates', href: '/templates', icon: TemplateIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Shared Plans', href: '/shared-plans', icon: UserGroupIcon },
    { name: 'Achievements', href: '/achievements', icon: TrophyIcon },
  ]

  useEffect(() => {
    // Load user data from API
    const loadUserData = async () => {
      try {
        const response = await fetch('/api/auth')
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUserName(data.user.displayName || 'User')
            setUserInitial(data.user.avatar || data.user.displayName?.charAt(0).toUpperCase() || 'U')
            setUserAvatar(data.user.avatar)
            setUserAvatarType(data.user.avatarType || 'initial')

            // Store user data in localStorage for offline access
            localStorage.setItem('user', JSON.stringify(data.user))
          }
        } else {
          // Fallback to localStorage if API fails
          const userDataStr = localStorage.getItem('user')
          if (userDataStr) {
            const userData = JSON.parse(userDataStr)
            if (userData.displayName) {
              setUserName(userData.displayName)
              setUserInitial(userData.avatar || userData.displayName.charAt(0).toUpperCase())
              setUserAvatar(userData.avatar)
              setUserAvatarType(userData.avatarType || 'initial')
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        // Fallback to localStorage
        const userDataStr = localStorage.getItem('user')
        if (userDataStr) {
          const userData = JSON.parse(userDataStr)
          if (userData.displayName) {
            setUserName(userData.displayName)
            setUserInitial(userData.avatar || userData.displayName.charAt(0).toUpperCase())
            setUserAvatar(userData.avatar)
            setUserAvatarType(userData.avatarType || 'initial')
          }
        }
      }
    }

    // Load user statistics from API
    const loadUserStats = async () => {
      try {
        const response = await fetch('/api/user/stats')
        if (response.ok) {
          const data = await response.json()
          if (data.stats) {
            setUserStats({
              totalTasks: data.stats.totalTasks || 0,
              focusSessions: data.stats.focusSessions || 0,
              currentStreak: data.stats.currentStreak || 0,
            })
          }
        }
      } catch (error) {
        console.error('Error loading user stats:', error)
      }
    }

    // Load achievements from API
    const loadAchievements = async () => {
      try {
        const response = await fetch('/api/achievements')
        if (response.ok) {
          const data = await response.json()
          const unlocked = data.achievements
            .filter((a: any) => a.unlocked)
            .sort((a: any, b: any) => {
              if (!a.unlockedAt) return 1
              if (!b.unlockedAt) return -1
              return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
            })
            .slice(0, 3)
          setRecentAchievements(unlocked)
        }
      } catch (error) {
        console.error('Error loading achievements:', error)
      }
    }

    // Load notifications from API
    const loadNotifications = async () => {
      try {
        const response = await fetch('/api/notifications')
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
        }
      } catch (error) {
        console.error('Error loading notifications:', error)
      }
    }

    // Initial load
    loadUserData()
    loadUserStats()
    loadAchievements()
    loadNotifications()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 mr-2"
              >
                {isMobileMenuOpen ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
              <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                <CheckCircleIcon className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Daily Companion
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors relative"
                  aria-label="Notifications"
                >
                  <BellIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-lg shadow-2xl border border-neutral-200 dark:border-neutral-700 z-50 animate-slide-down">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                          Notifications
                        </h3>
                        {notifications.filter(n => !n.read).length > 0 && (
                          <button
                            onClick={async () => {
                              try {
                                await fetch('/api/notifications', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ markAllRead: true }),
                                })
                                setNotifications(notifications.map(n => ({ ...n, read: true })))
                              } catch (error) {
                                console.error('Error marking notifications as read:', error)
                              }
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors ${
                              !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                {notification.type === 'achievement' && '🏆'}
                                {notification.type === 'task' && '✓'}
                                {notification.type === 'system' && '📢'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                  <h4 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2 mt-1" />
                                  )}
                                </div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                                  {notification.time.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Profile"
              >
                {userAvatarType === 'photo' && userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-600"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {userInitial}
                  </div>
                )}
                <span className="hidden md:inline text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Profile
                </span>
              </Link>

              <Link
                href="/settings"
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Settings"
              >
                <SettingsIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              </Link>

              {/* Exit to Home */}
              <button
                onClick={() => setShowLogoutDialog(true)}
                className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300"
                aria-label="Exit to Home"
              >
                Exit
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content with Sidebar */}
      <div className="flex gap-6 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>

        {/* Right Sidebar - Mini Profile & Achievements */}
        <aside className="hidden xl:block w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Mini Profile Card */}
            <div className="card">
              <Link href="/profile" className="block hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3 mb-4">
                  {userAvatarType === 'photo' && userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-600"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      {userInitial}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {userName}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      View Profile →
                    </div>
                  </div>
                </div>
              </Link>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{userStats.totalTasks}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{userStats.focusSessions}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Focus</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{userStats.currentStreak}🔥</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Streak</div>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Recent Achievements
                </h3>
                <Link href="/achievements" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  View All
                </Link>
              </div>

              {recentAchievements.length > 0 ? (
                <div className="space-y-3">
                  {recentAchievements.map((achievement, index) => {
                    const colors = [
                      'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800',
                      'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800',
                      'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800',
                    ]
                    return (
                      <div key={achievement.id} className={`p-3 bg-gradient-to-br ${colors[index]} rounded-lg border`}>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                              {achievement.name}
                            </div>
                            <div className="text-xs text-neutral-600 dark:text-neutral-400">
                              {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unlocked'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-neutral-500 dark:text-neutral-400 text-sm">
                  No achievements yet. Complete tasks to unlock achievements!
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl max-w-md w-full p-6 animate-scale-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Confirm Logout
              </h3>
            </div>

            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Are you sure you want to exit? You will be returned to the home page.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <Link
                href="/"
                onClick={() => {
                  // Clear user session data from localStorage
                  localStorage.removeItem('user')
                  localStorage.removeItem('tasks')
                  localStorage.removeItem('achievements')
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Exit
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
