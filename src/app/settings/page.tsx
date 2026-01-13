'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useTheme } from '@/contexts/ThemeContext'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const [userEmail, setUserEmail] = useState<string>('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

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

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    // Load user profile data
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true)
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setUserEmail(data.email || '')
        } else {
          console.error('Failed to load user profile')
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadProfile()
  }, [])

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key],
    }))
  }

  const handleNumberChange = (key: keyof typeof settings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleChangePassword = async () => {
    setPasswordError('')

    // Validate passwords
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please fill in all fields')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      if (response.ok) {
        alert('Password changed successfully!')
        setShowPasswordModal(false)
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        const data = await response.json()
        setPasswordError(data.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setPasswordError('An error occurred. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return
    }

    setIsDeleting(true)

    try {
      // Call delete API endpoint
      const response = await fetch('/api/user', {
        method: 'DELETE',
      })

      if (response.ok) {
        // Clear local storage
        localStorage.clear()
        // Redirect to home page
        router.push('/')
      } else {
        alert('Failed to delete account. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsDeleting(false)
    }
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
                  value={isLoadingProfile ? 'Loading...' : (userEmail || 'No email')}
                  className="input"
                  disabled
                />
              </div>

              <div className="flex gap-3">
                <button
                  className="btn btn-secondary flex-1"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Password
                </button>
                <button className="btn btn-secondary flex-1">
                  Export Data
                </button>
              </div>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn bg-red-600 hover:bg-red-700 text-white w-full"
              >
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

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Change Password
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input"
                  placeholder="Enter current password"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="input"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="input"
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {passwordError}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  })
                  setPasswordError('')
                }}
                className="btn btn-secondary flex-1"
                disabled={isChangingPassword}
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="btn btn-primary flex-1"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Delete Account
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>

            <div className="mb-6">
              <label className="label mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="input"
                placeholder="Type DELETE"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                }}
                className="btn btn-secondary flex-1"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="btn bg-red-600 hover:bg-red-700 text-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
