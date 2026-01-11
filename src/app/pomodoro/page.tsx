'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { PlayIcon, PauseIcon, CheckCircleIcon } from '@/components/icons'
import { SpotifyPlayer } from '@/components/spotify/SpotifyPlayer'

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

export default function PomodoroPage() {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const durations = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  }

  const modeLabels = {
    focus: 'Focus Time',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  }

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Pomodoro Timer
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Stay focused with the Pomodoro Technique
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-8 justify-center">
          {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mode === m
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
              }`}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="card bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 text-center">
          {/* Progress Ring */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-80 h-80">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-neutral-200 dark:text-neutral-700"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 85}`}
                  strokeDashoffset={`${2 * Math.PI * 85 * (1 - progress / 100)}`}
                  className={`transition-all duration-1000 ${
                    mode === 'focus'
                      ? 'text-blue-600'
                      : mode === 'shortBreak'
                      ? 'text-green-600'
                      : 'text-purple-600'
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              {/* Time Display Inside Circle */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-7xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 font-mono">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-lg text-neutral-600 dark:text-neutral-400">
                  {modeLabels[mode]}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={toggleTimer}
              className={`btn btn-primary text-lg px-8 py-4 flex items-center gap-2 ${
                isRunning ? 'bg-orange-600 hover:bg-orange-700' : ''
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
            </button>
            <button
              onClick={resetTimer}
              className="btn btn-secondary text-lg px-6 py-4"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {completedPomodoros}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Completed Today
            </div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {Math.floor(completedPomodoros * 25 / 60)}h {(completedPomodoros * 25) % 60}m
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Focus Time
            </div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {completedPomodoros > 0 ? Math.floor(100 / completedPomodoros) : 0}%
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Productivity
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Pomodoro Tips
          </h3>
          <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Work for 25 minutes without distractions</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Take a 5-minute break after each pomodoro</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>After 4 pomodoros, take a longer 15-30 minute break</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Spotify Player */}
      <SpotifyPlayer />
    </DashboardLayout>
  )
}
