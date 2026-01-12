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
import { useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Today', href: '/dashboard', icon: CalendarIcon },
    { name: 'Pomodoro', href: '/pomodoro', icon: ClockIcon },
    { name: 'Templates', href: '/templates', icon: TemplateIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Shared Plans', href: '/shared-plans', icon: UserGroupIcon },
    { name: 'Achievements', href: '/achievements', icon: TrophyIcon },
  ]

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
                  U
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

      {/* Main Content */}
      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4rem)] overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
