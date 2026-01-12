'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CheckCircleIcon,
  BellIcon,
  MapPinIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@/components/icons'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function HomePage() {
  const router = useRouter()

  const handleTryDemo = () => {
    // Clear all user data before entering demo mode
    localStorage.clear()
    router.push('/dashboard')
  }
  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-neutral-900">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 dark:bg-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/30 dark:bg-purple-400/20 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/30 dark:bg-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-orange-500/20 dark:bg-orange-400/10 rounded-full blur-3xl animate-float-reverse" style={{ animationDelay: '10s' }} />
        <div className="absolute bottom-40 right-10 w-56 h-56 bg-green-500/20 dark:bg-green-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '15s' }} />
      </div>

      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <CheckCircleIcon className="h-8 w-8 text-blue-600 animate-bounce-in" />
              <span className="ml-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Daily Companion
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/auth/login"
                className="btn btn-ghost hidden sm:inline-flex"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="btn btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-neutral-900 dark:text-neutral-100 leading-relaxed mb-8 py-4">
              Your Personal
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text animate-scale-in mt-4 pb-4">
                Productivity Companion
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-3xl mx-auto">
              Plan your day with context-aware reminders based on time, location, and activity.
              Stay focused with Pomodoro sessions and collaborate with shared plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/register"
                className="btn btn-primary text-lg px-8 py-4 shadow-xl hover:shadow-2xl animate-bounce-in w-full sm:w-auto"
              >
                🚀 Get started - it&apos;s free
              </Link>
              <button
                onClick={handleTryDemo}
                className="btn btn-ghost text-lg px-8 py-4 border-2 border-neutral-300 dark:border-neutral-600 w-full sm:w-auto"
              >
                ✨ Try Live Demo
              </button>
            </div>
          </div>

          {/* Floating Task Cards Preview */}
          <div className="mt-20 relative h-96 hidden lg:block">
            <div className="absolute top-0 left-1/4 w-64 card hover-lift animate-slide-up shadow-xl border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-blue-500" />
                <div className="flex-1">
                  <div className="font-medium">Team Meeting</div>
                  <div className="text-sm text-neutral-500">10:00 AM</div>
                </div>
              </div>
            </div>
            <div className="absolute top-24 right-1/4 w-64 card hover-lift animate-slide-up delay-200 shadow-xl border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <div className="font-medium line-through text-neutral-400">Morning Run</div>
                  <div className="text-sm text-neutral-500">Completed</div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-1/3 w-64 card hover-lift animate-slide-up delay-400 shadow-xl border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <MapPinIcon className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <div className="font-medium">Buy Groceries</div>
                  <div className="text-sm text-neutral-500">📍 Near store</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Everything you need to stay productive
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Powerful features designed for modern productivity
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BellIcon className="h-10 w-10 text-blue-600" />}
              title="Smart Reminders"
              description="Get notified at the right time, place, or when you reach your step goal"
              delay="0"
            />
            <FeatureCard
              icon={<MapPinIcon className="h-10 w-10 text-purple-600" />}
              title="Location-Based Tasks"
              description="Attach locations to tasks and get reminded when you arrive"
              delay="100"
            />
            <FeatureCard
              icon={<ClockIcon className="h-10 w-10 text-orange-600" />}
              title="Pomodoro Focus"
              description="Built-in timer to help you stay focused with proven techniques"
              delay="200"
            />
            <FeatureCard
              icon={<CheckCircleIcon className="h-10 w-10 text-green-600" />}
              title="Quick Templates"
              description="Save time with reusable task templates for recurring activities"
              delay="300"
            />
            <FeatureCard
              icon={<ChartBarIcon className="h-10 w-10 text-pink-600" />}
              title="Analytics & Insights"
              description="Track your productivity trends and export data for analysis"
              delay="400"
            />
            <FeatureCard
              icon={<UserGroupIcon className="h-10 w-10 text-indigo-600" />}
              title="Shared Plans"
              description="Collaborate with others and delegate tasks seamlessly"
              delay="500"
            />
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="text-6xl mb-6">🔐</div>
          <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Privacy First
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-4">
            Your data stays yours. Work offline by default with optional cloud sync.
            All sensitive data is encrypted end-to-end.
          </p>
          <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-lg">
            Read our Privacy Policy →
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-scale-in">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to boost your productivity?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users who trust Daily Companion
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-2xl"
          >
            🎯 Start Planning Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Daily Companion</h3>
              <p className="text-sm">Your personal productivity partner</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-sm">
            <p>&copy; 2026 Daily Companion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  delay = "0"
}: {
  icon: React.ReactNode
  title: string
  description: string
  delay?: string
}) {
  return (
    <div
      className="card hover-lift animate-slide-up bg-white dark:bg-neutral-800 p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
    </div>
  )
}
