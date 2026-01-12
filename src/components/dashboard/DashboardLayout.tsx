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
  XIcon
} from '@/components/icons'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import { getAchievements } from '@/lib/storage/achievements'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [recentAchievements, setRecentAchievements] = useState<any[]>([])
  const [userName, setUserName] = useState('User')
  const [userInitial, setUserInitial] = useState('U')

  const navigation = [
    { name: 'Today', href: '/dashboard', icon: CalendarIcon },
    { name: 'Pomodoro', href: '/pomodoro', icon: ClockIcon },
    { name: 'Templates', href: '/templates', icon: TemplateIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Shared Plans', href: '/shared-plans', icon: UserGroupIcon },
    { name: 'Achievements', href: '/achievements', icon: TrophyIcon },
  ]

  useEffect(() => {
    // Load recent unlocked achievements
    const achievements = getAchievements()
    const unlocked = achievements
      .filter(a => a.unlocked)
      .sort((a, b) => {
        if (!a.unlockedAt) return 1
        if (!b.unlockedAt) return -1
        return b.unlockedAt.getTime() - a.unlockedAt.getTime()
      })
      .slice(0, 3)
    setRecentAchievements(unlocked)

    // Load user data from localStorage
    try {
      const userDataStr = localStorage.getItem('user')
      if (userDataStr) {
        const userData = JSON.parse(userDataStr)
        if (userData.displayName) {
          setUserName(userData.displayName)
          setUserInitial(userData.displayName.charAt(0).toUpperCase())
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
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

              {/* Profile Menu */}
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Profile"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {userInitial}
                </div>
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
              <Link
                href="/"
                className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300"
                aria-label="Exit to Home"
              >
                Exit
              </Link>
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                    {userInitial}
                  </div>
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
                  <div className="text-lg font-bold text-blue-600">12</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">8</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Focus</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">3🔥</div>
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
    </div>
  )
}
