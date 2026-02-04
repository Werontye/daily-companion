'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { PlayIcon, PauseIcon, CheckCircleIcon, ClockIcon, TrophyIcon } from '@/components/icons'
import { SpotifyPlayer } from '@/components/spotify/SpotifyPlayer'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, staggerItem, modalVariants, overlayVariants } from '@/lib/motion'

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

const modeConfig = {
  focus: {
    label: 'Focus Time',
    color: 'primary',
    bgClass: 'from-primary-600 to-primary-700',
    ringClass: 'text-primary-500',
    iconBg: 'bg-primary-600',
  },
  shortBreak: {
    label: 'Short Break',
    color: 'success',
    bgClass: 'from-success to-emerald-600',
    ringClass: 'text-success',
    iconBg: 'bg-success',
  },
  longBreak: {
    label: 'Long Break',
    color: 'accent',
    bgClass: 'from-accent-500 to-cyan-600',
    ringClass: 'text-accent-500',
    iconBg: 'bg-accent-500',
  },
}

export default function PomodoroPage() {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [isRunning, setIsRunning] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [durations, setDurations] = useState({
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  })

  const [timeLeft, setTimeLeft] = useState(durations.focus)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleTimerComplete = () => {
    setIsRunning(false)

    // Play notification sound (optional)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Pomodoro Complete!', {
          body: mode === 'focus'
            ? 'Great job! Time for a break.'
            : 'Break is over. Ready to focus again?',
          icon: '/icon-192.png',
        })
      }
    }

    if (mode === 'focus') {
      setCompletedPomodoros(prev => prev + 1)
      // After 4 pomodoros, suggest long break
      const nextMode = (completedPomodoros + 1) % 4 === 0 ? 'longBreak' : 'shortBreak'
      setMode(nextMode)
      setTimeLeft(durations[nextMode])
    } else {
      setMode('focus')
      setTimeLeft(durations.focus)
    }
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(durations[mode])
  }

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    setTimeLeft(durations[newMode])
    setIsRunning(false)
  }

  const updateDuration = (timerMode: TimerMode, minutes: number) => {
    const seconds = minutes * 60
    setDurations(prev => ({
      ...prev,
      [timerMode]: seconds,
    }))
    // If updating current mode, reset timer
    if (timerMode === mode && !isRunning) {
      setTimeLeft(seconds)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100
  const circumference = 2 * Math.PI * 85
  const currentConfig = modeConfig[mode]

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 relative"
        >
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(true)}
            className="absolute right-0 top-0 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
            aria-label="Timer Settings"
          >
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </motion.button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
            Pomodoro Timer
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Stay focused with the Pomodoro Technique
          </p>
        </motion.div>

        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 justify-center p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl"
        >
          {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map(m => (
            <motion.button
              key={m}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => switchMode(m)}
              className={`relative px-5 py-2.5 rounded-xl font-medium transition-all ${
                mode === m
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {mode === m && (
                <motion.div
                  layoutId="active-mode"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${modeConfig[m].bgClass} shadow-lg`}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{modeConfig[m].label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Timer Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800 p-8 text-center overflow-hidden relative"
        >
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-r ${currentConfig.bgClass} blur-3xl`}
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-gradient-to-r ${currentConfig.bgClass} blur-3xl`}
            />
          </div>

          {/* Progress Ring */}
          <div className="flex items-center justify-center mb-8 relative">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80">
              {/* Background glow when running */}
              <AnimatePresence>
                {isRunning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`absolute inset-0 rounded-full ${currentConfig.ringClass} blur-2xl opacity-20`}
                  />
                )}
              </AnimatePresence>

              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-slate-200 dark:text-slate-700"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="100"
                  cy="100"
                  r="85"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={currentConfig.ringClass}
                  strokeLinecap="round"
                />
              </svg>

              {/* Time Display Inside Circle */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  key={timeLeft}
                  initial={{ scale: 1.05, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl sm:text-7xl font-bold text-slate-900 dark:text-slate-100 mb-2 font-mono tracking-tight"
                >
                  {formatTime(timeLeft)}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    mode === 'focus'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : mode === 'shortBreak'
                      ? 'bg-success-100 dark:bg-success/20 text-success-700 dark:text-success'
                      : 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400'
                  }`}
                >
                  {currentConfig.label}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center relative z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-semibold text-white shadow-lg transition-all ${
                isRunning
                  ? 'bg-gradient-to-r from-warning to-orange-500 shadow-warning/30 hover:shadow-warning/50'
                  : `bg-gradient-to-r ${currentConfig.bgClass} shadow-primary-600/30 hover:shadow-primary-600/50`
              }`}
            >
              {isRunning ? (
                <>
                  <PauseIcon className="h-6 w-6" />
                  Pause
                </>
              ) : (
                <>
                  <PlayIcon className="h-6 w-6" />
                  Start
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="btn-secondary px-6 py-4 text-lg"
            >
              Reset
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mt-8 grid grid-cols-3 gap-4"
        >
          <motion.div
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(79, 70, 229, 0.3)' }}
            className="card text-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 border border-primary-200/50 dark:border-primary-800/50"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
            <motion.div
              key={completedPomodoros}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-primary-600 mb-1"
            >
              {completedPomodoros}
            </motion.div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Completed
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(16, 185, 129, 0.3)' }}
            className="card text-center bg-gradient-to-br from-success-50 to-emerald-100 dark:from-success/20 dark:to-emerald-800/20 border border-success-200/50 dark:border-success/30"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-success flex items-center justify-center shadow-lg shadow-success/30">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-bold text-success-600 dark:text-success mb-1">
              {Math.floor(completedPomodoros * 25 / 60)}h {(completedPomodoros * 25) % 60}m
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Focus Time
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(6, 182, 212, 0.3)' }}
            className="card text-center bg-gradient-to-br from-accent-50 to-cyan-100 dark:from-accent-900/30 dark:to-cyan-800/20 border border-accent-200/50 dark:border-accent-800/50"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-accent-500 flex items-center justify-center shadow-lg shadow-accent-500/30">
              <TrophyIcon className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-bold text-accent-600 dark:text-accent-400 mb-1">
              {4 - (completedPomodoros % 4)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Until Break
            </div>
          </motion.div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 card bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200/50 dark:border-primary-800/50"
        >
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-lg">💡</span>
            Pomodoro Tips
          </h3>
          <ul className="space-y-3">
            {[
              'Work for 25 minutes without distractions',
              'Take a 5-minute break after each pomodoro',
              'After 4 pomodoros, take a longer 15-30 minute break',
            ].map((tip, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircleIcon className="h-4 w-4 text-primary-600" />
                </div>
                <span className="text-slate-700 dark:text-slate-300 text-sm">{tip}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Spotify Player */}
      <SpotifyPlayer />

      {/* Timer Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Timer Settings
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Focus Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={Math.floor(durations.focus / 60)}
                    onChange={(e) => updateDuration('focus', parseInt(e.target.value) || 25)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={Math.floor(durations.shortBreak / 60)}
                    onChange={(e) => updateDuration('shortBreak', parseInt(e.target.value) || 5)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={Math.floor(durations.longBreak / 60)}
                    onChange={(e) => updateDuration('longBreak', parseInt(e.target.value) || 15)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSettings(false)}
                className="btn-primary w-full mt-6"
              >
                Save Settings
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
