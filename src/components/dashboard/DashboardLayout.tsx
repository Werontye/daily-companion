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
import { onProfileUpdate } from '@/lib/events/profileEvents'
import { motion, AnimatePresence } from 'framer-motion'
import { dropdownVariants, slideUp, modalVariants, overlayVariants, staggerContainer, staggerItem } from '@/lib/motion'

interface Notification {
  id: string
  title: string
  message: string
  time: Date
  read: boolean
  type: 'achievement' | 'task' | 'system' | 'friend_request'
  relatedId?: string
  actionTaken?: boolean
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

    // Listen for profile updates to instantly reflect changes
    const unsubscribe = onProfileUpdate((detail) => {
      if (detail.displayName) {
        setUserName(detail.displayName)
        setUserInitial(detail.displayName.charAt(0).toUpperCase())
      }
      if (detail.avatar) {
        setUserAvatar(detail.avatar)
      }
      if (detail.avatarType) {
        setUserAvatarType(detail.avatarType)
      }
    })

    return () => unsubscribe()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-notifications]') && showNotifications) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Top Navigation - Glass Effect */}
      <nav className="glass sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 mr-2 transition-colors"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <XIcon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <MenuIcon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircleIcon className="h-8 w-8 text-primary-600" />
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent group-hover:from-primary-500 group-hover:to-accent-400 transition-all">
                  Daily Companion
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* Notifications */}
              <div className="relative" data-notifications>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                  aria-label="Notifications"
                >
                  <BellIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-white dark:ring-slate-900"
                    />
                  )}
                </motion.button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            Notifications
                          </h3>
                          {notifications.filter(n => !n.read).length > 0 && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
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
                              className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                            >
                              Mark all read
                            </motion.button>
                          )}
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <BellIcon className="w-6 h-6 text-slate-400" />
                            </div>
                            No notifications yet
                          </div>
                        ) : (
                          <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                          >
                            {notifications.map(notification => (
                              <motion.div
                                key={notification.id}
                                variants={staggerItem}
                                className={`p-4 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                                  !notification.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                                    notification.type === 'achievement'
                                      ? 'bg-warning-100 dark:bg-warning/20'
                                      : notification.type === 'task'
                                      ? 'bg-success-100 dark:bg-success/20'
                                      : notification.type === 'friend_request'
                                      ? 'bg-accent-100 dark:bg-accent-900/30'
                                      : 'bg-primary-100 dark:bg-primary-900/30'
                                  }`}>
                                    {notification.type === 'achievement' && '🏆'}
                                    {notification.type === 'task' && '✓'}
                                    {notification.type === 'friend_request' && '👥'}
                                    {notification.type === 'system' && '📢'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-1">
                                      <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                        {notification.title}
                                      </h4>
                                      {!notification.read && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 ml-2 mt-1"
                                        />
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                                      {new Date(notification.time).toLocaleTimeString('en-GB', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                      })}
                                    </p>
                                    {/* Accept/Decline buttons for friend requests */}
                                    {notification.type === 'friend_request' && !notification.actionTaken && notification.relatedId && (
                                      <div className="flex gap-2 mt-3">
                                        <motion.button
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          onClick={async (e) => {
                                            e.stopPropagation()
                                            try {
                                              const response = await fetch('/api/friends', {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                  friendshipId: notification.relatedId,
                                                  action: 'accept'
                                                }),
                                              })
                                              if (response.ok) {
                                                setNotifications(notifications.map(n =>
                                                  n.id === notification.id
                                                    ? { ...n, actionTaken: true, read: true }
                                                    : n
                                                ))
                                              }
                                            } catch (error) {
                                              console.error('Error accepting friend request:', error)
                                            }
                                          }}
                                          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-success-100 dark:bg-success/20 text-success-700 dark:text-success hover:bg-success-200 dark:hover:bg-success/30 transition-colors"
                                        >
                                          Accept
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          onClick={async (e) => {
                                            e.stopPropagation()
                                            try {
                                              const response = await fetch('/api/friends', {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                  friendshipId: notification.relatedId,
                                                  action: 'decline'
                                                }),
                                              })
                                              if (response.ok) {
                                                setNotifications(notifications.map(n =>
                                                  n.id === notification.id
                                                    ? { ...n, actionTaken: true, read: true }
                                                    : n
                                                ))
                                              }
                                            } catch (error) {
                                              console.error('Error declining friend request:', error)
                                            }
                                          }}
                                          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                          Decline
                                        </motion.button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Menu */}
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                aria-label="Profile"
              >
                {userAvatarType === 'photo' && userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-600 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 group-hover:ring-primary-500 transition-all"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                    {userInitial}
                  </div>
                )}
                <span className="hidden md:inline text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  Profile
                </span>
              </Link>

              {/* Settings */}
              <Link
                href="/settings"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                aria-label="Settings"
              >
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsIcon className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                </motion.div>
              </Link>

              {/* Exit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLogoutDialog(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
                aria-label="Exit to Home"
              >
                Exit
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden border-t border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
            >
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="px-4 py-3 space-y-1"
              >
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <motion.div key={item.name} variants={staggerItem}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                        {isActive && (
                          <motion.div
                            layoutId="mobile-active-indicator"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600"
                          />
                        )}
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card overflow-hidden"
            >
              {/* Gradient Header */}
              <div className="h-16 bg-gradient-to-r from-primary-600 to-accent-500 -mx-6 -mt-6 mb-4" />

              <Link href="/profile" className="block hover:opacity-90 transition-opacity -mt-10 relative">
                <div className="flex items-end gap-3 mb-4">
                  {userAvatarType === 'photo' && userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Profile"
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white dark:ring-slate-800">
                      {userInitial}
                    </div>
                  )}
                  <div className="flex-1 pb-1">
                    <div className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                      {userName}
                    </div>
                    <div className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                      View Profile →
                    </div>
                  </div>
                </div>
              </Link>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20"
                >
                  <div className="text-xl font-bold text-primary-600">{userStats.totalTasks}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Tasks</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-2 rounded-xl bg-warning-50 dark:bg-warning/10"
                >
                  <div className="text-xl font-bold text-warning-600 dark:text-warning">{userStats.focusSessions}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Focus</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-2 rounded-xl bg-success-50 dark:bg-success/10"
                >
                  <div className="text-xl font-bold text-success-600 dark:text-success">{userStats.currentStreak}🔥</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Streak</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Recent Achievements
                </h3>
                <Link
                  href="/achievements"
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  View All
                </Link>
              </div>

              {recentAchievements.length > 0 ? (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {recentAchievements.map((achievement, index) => {
                    const gradients = [
                      'from-warning-100 to-orange-100 dark:from-warning/20 dark:to-orange-900/20 border-warning-200 dark:border-warning/30',
                      'from-purple-100 to-primary-100 dark:from-purple-900/20 dark:to-primary-900/20 border-purple-200 dark:border-purple-800/30',
                      'from-accent-100 to-blue-100 dark:from-accent-900/20 dark:to-blue-900/20 border-accent-200 dark:border-accent-800/30',
                    ]
                    return (
                      <motion.div
                        key={achievement.id}
                        variants={staggerItem}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className={`p-3 bg-gradient-to-br ${gradients[index]} rounded-xl border transition-all cursor-pointer`}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            initial={{ rotate: -10 }}
                            animate={{ rotate: 0 }}
                            className="text-2xl"
                          >
                            {achievement.icon}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                              {achievement.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {achievement.unlockedAt
                                ? new Date(achievement.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : 'Unlocked'
                              }
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <TrophyIcon className="w-7 h-7 text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    No achievements yet
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                    Complete tasks to unlock achievements!
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </aside>
      </div>

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {showLogoutDialog && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLogoutDialog(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-danger-100 dark:bg-danger/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Confirm Logout
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Are you sure you want to exit?
                  </p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-6 pl-16">
                You will be returned to the home page. Your data will be saved.
              </p>

              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutDialog(false)}
                  className="px-5 py-2.5 rounded-xl font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all border border-slate-200 dark:border-slate-600"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Clear user session data from localStorage
                    localStorage.removeItem('user')
                    localStorage.removeItem('tasks')
                    localStorage.removeItem('achievements')
                    window.location.href = '/'
                  }}
                  className="px-5 py-2.5 rounded-xl font-medium bg-danger hover:bg-red-700 text-white transition-all shadow-md hover:shadow-lg"
                >
                  Exit
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
