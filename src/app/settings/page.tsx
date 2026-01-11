'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { locale, setLocale } = useLanguage()

  const [settings, setSettings] = useState({
    notifications: true,
    emailDigest: false,
    soundEffects: true,
    pomodoroLength: 25,
    shortBreakLength: 5,
    longBreakLength: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as string],
    }))
  }

  const handleNumberChange = (key: keyof typeof settings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            Settings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Customize your Daily Companion experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Appearance
            </h2>

            <div className="space-y-4">
              {/* Theme */}
              <div>
                <label className="label mb-2">Theme</label>
                <div className="flex gap-3">
                  {(['light', 'dark', 'system'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all capitalize ${
                        theme === t
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="label mb-2">Language</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLocale('en')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      locale === 'en'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => setLocale('ru')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      locale === 'ru'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                    }`}
                  >
                    🇷🇺 Русский
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Notifications
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    Push Notifications
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Get notified about tasks and reminders
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('notifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    Email Digest
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Receive daily summary via email
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('emailDigest')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.emailDigest ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.emailDigest ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    Sound Effects
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Play sounds for timer and notifications
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('soundEffects')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.soundEffects ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.soundEffects ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Pomodoro Settings */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Pomodoro Timer
            </h2>

            <div className="space-y-4">
              <div>
                <label className="label">Focus Session Length (minutes)</label>
                <input
                  type="number"
                  value={settings.pomodoroLength}
                  onChange={(e) => handleNumberChange('pomodoroLength', parseInt(e.target.value))}
                  className="input"
                  min="1"
                  max="60"
                />
              </div>

              <div>
                <label className="label">Short Break Length (minutes)</label>
                <input
                  type="number"
                  value={settings.shortBreakLength}
                  onChange={(e) => handleNumberChange('shortBreakLength', parseInt(e.target.value))}
                  className="input"
                  min="1"
                  max="30"
                />
              </div>

              <div>
                <label className="label">Long Break Length (minutes)</label>
                <input
                  type="number"
                  value={settings.longBreakLength}
                  onChange={(e) => handleNumberChange('longBreakLength', parseInt(e.target.value))}
                  className="input"
                  min="1"
                  max="60"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    Auto-start Breaks
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Automatically start break timer after focus session
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('autoStartBreaks')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoStartBreaks ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoStartBreaks ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    Auto-start Pomodoros
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Automatically start next focus session after break
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('autoStartPomodoros')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoStartPomodoros ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoStartPomodoros ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Account
            </h2>

            <div className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value="user@example.com"
                  className="input"
                  disabled
                />
              </div>

              <div className="flex gap-3">
                <button className="btn btn-secondary flex-1">
                  Change Password
                </button>
                <button className="btn btn-secondary flex-1">
                  Export Data
                </button>
              </div>

              <button className="btn bg-red-600 hover:bg-red-700 text-white w-full">
                Delete Account
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <button className="btn btn-secondary">
              Reset to Defaults
            </button>
            <button className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
