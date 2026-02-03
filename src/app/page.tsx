'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CheckCircleIcon,
  BellIcon,
  MapPinIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  TrophyIcon
} from '@/components/icons'
import { ThemeToggle } from '@/components/ThemeToggle'
import { resetToDemo } from '@/lib/demoMode'
import { staggerContainer, staggerItem, fadeUp, springPop } from '@/lib/motion'

export default function HomePage() {
  const router = useRouter()

  const handleTryDemo = () => {
    resetToDemo()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Gradient Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary-500/20 dark:bg-primary-400/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-40 right-20 w-[600px] h-[600px] bg-purple-500/20 dark:bg-purple-400/10 rounded-full blur-[120px] animate-float-reverse" />
        <div className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-pink-500/15 dark:bg-pink-400/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: '5s' }} />
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-accent-500/15 dark:bg-accent-400/10 rounded-full blur-[70px] animate-float-reverse" style={{ animationDelay: '10s' }} />
      </div>

      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircleIcon className="h-9 w-9 text-primary-600" />
                </motion.div>
                <span className="ml-2.5 text-xl font-bold text-slate-900 dark:text-white">
                  Daily Companion
                </span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <ThemeToggle />
              <Link href="/auth/login" className="btn btn-ghost hidden sm:inline-flex">
                Sign In
              </Link>
              <Link href="/auth/register" className="btn btn-primary">
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 sm:pt-24 lg:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                Your Personal
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="block mt-2 text-gradient-hero"
                >
                  Productivity Companion
                </motion.span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-8 text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed"
            >
              Plan your day with context-aware reminders based on time, location, and activity.
              Stay focused with Pomodoro sessions and collaborate with shared plans.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/auth/register"
                className="btn btn-primary btn-lg shadow-xl hover:shadow-glow-lg w-full sm:w-auto"
              >
                Get started free
              </Link>
              <button
                onClick={handleTryDemo}
                className="btn btn-secondary btn-lg w-full sm:w-auto"
              >
                Try Live Demo
              </button>
            </motion.div>
          </div>

          {/* Floating Task Cards Preview */}
          <div className="mt-24 relative h-[450px] hidden lg:block">
            {/* Card 1 - Team Meeting */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.15)' }}
              className="absolute top-0 left-[15%] w-72 card card-static p-5 shadow-elevated border border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="priority-dot priority-high" />
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 dark:text-white">Team Meeting</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                    <ClockIcon className="w-3.5 h-3.5" />
                    10:00 - 11:00
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <span className="badge badge-primary">Work</span>
                <span className="badge badge-warning">Important</span>
              </div>
            </motion.div>

            {/* Card 2 - Completed Task */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.15)' }}
              className="absolute top-24 right-[15%] w-72 card card-static p-5 shadow-elevated border border-slate-200/50 dark:border-slate-700/50 opacity-70"
            >
              <div className="flex items-center gap-4">
                <div className="priority-dot priority-low" />
                <CheckCircleIcon className="w-6 h-6 text-success" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-400 dark:text-slate-500 line-through">Morning Run</div>
                  <div className="text-sm text-success flex items-center gap-1.5 mt-1">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Completed
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3 - Location Task */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.15)' }}
              className="absolute bottom-10 left-[30%] w-72 card card-static p-5 shadow-elevated border border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="priority-dot priority-medium" />
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 dark:text-white">Buy Groceries</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    Near Whole Foods
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4, duration: 0.5, type: 'spring' }}
              className="absolute bottom-24 right-[20%] bg-gradient-primary p-5 rounded-2xl shadow-glow-lg text-white"
            >
              <div className="text-3xl font-bold">87%</div>
              <div className="text-sm text-white/80">Tasks completed today</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/80 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to stay productive
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features designed for modern productivity workflows
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <FeatureCard
              icon={<BellIcon className="h-8 w-8" />}
              iconBg="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
              title="Smart Reminders"
              description="Get notified at the right time, place, or when you reach your step goal"
            />
            <FeatureCard
              icon={<MapPinIcon className="h-8 w-8" />}
              iconBg="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              title="Location-Based Tasks"
              description="Attach locations to tasks and get reminded when you arrive"
            />
            <FeatureCard
              icon={<ClockIcon className="h-8 w-8" />}
              iconBg="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
              title="Pomodoro Focus"
              description="Built-in timer to help you stay focused with proven techniques"
            />
            <FeatureCard
              icon={<CheckCircleIcon className="h-8 w-8" />}
              iconBg="bg-success-100 dark:bg-success/20 text-success dark:text-success"
              title="Quick Templates"
              description="Save time with reusable task templates for recurring activities"
            />
            <FeatureCard
              icon={<ChartBarIcon className="h-8 w-8" />}
              iconBg="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
              title="Analytics & Insights"
              description="Track your productivity trends and export data for analysis"
            />
            <FeatureCard
              icon={<UserGroupIcon className="h-8 w-8" />}
              iconBg="bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400"
              title="Shared Plans"
              description="Collaborate with others and delegate tasks seamlessly"
            />
          </motion.div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center">
            <span className="text-4xl">🔐</span>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
            Privacy First
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Your data stays yours. Work offline by default with optional cloud sync.
            All sensitive data is encrypted end-to-end.
          </p>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-lg transition-colors"
          >
            Read our Privacy Policy
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to boost your productivity?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of users who trust Daily Companion to organize their lives
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-slate-50 hover:scale-105 transition-all shadow-2xl"
          >
            <TrophyIcon className="w-6 h-6" />
            Start Planning Today
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircleIcon className="h-7 w-7 text-primary-500" />
                <span className="text-white font-bold text-lg">Daily Companion</span>
              </div>
              <p className="text-sm leading-relaxed">Your personal productivity partner for a more organized life.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm">
            <p>&copy; 2026 Daily Companion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
}) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(15, 23, 42, 0.15)' }}
      className="card card-static p-6 bg-white dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50"
    >
      <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center mb-5`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}
