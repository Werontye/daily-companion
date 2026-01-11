'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Toast } from '@/components/ui/toast/Toast'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Productivity enthusiast and software developer. Love organizing my day!',
    avatar: 'U',
    joinDate: new Date('2026-01-01'),
  })

  const [editedProfile, setEditedProfile] = useState(profile)

  const handleSave = () => {
    if (!editedProfile.name.trim()) {
      setToast({ message: 'Name cannot be empty', type: 'error' })
      return
    }

    setProfile(editedProfile)
    setIsEditing(false)
    setToast({ message: 'Profile updated successfully!', type: 'success' })
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleAvatarChange = (letter: string) => {
    setEditedProfile({ ...editedProfile, avatar: letter.toUpperCase() })
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            Profile
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card text-center sticky top-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-5xl mx-auto mb-4">
                {isEditing ? editedProfile.avatar : profile.avatar}
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {isEditing ? editedProfile.name : profile.name}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {profile.email}
              </p>
              <div className="text-sm text-neutral-500 mb-6">
                Member since {profile.joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary w-full"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                Basic Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      className="input"
                      placeholder="Your full name"
                    />
                  ) : (
                    <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                      {profile.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Email</label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {profile.email}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Contact support to change your email
                  </p>
                </div>

                <div>
                  <label className="label">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.bio}
                      onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                      className="input min-h-[100px]"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-neutral-700 dark:text-neutral-300">
                      {profile.bio}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div>
                    <label className="label">Avatar Initial</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editedProfile.avatar}
                        onChange={(e) => handleAvatarChange(e.target.value.slice(0, 1))}
                        className="input"
                        placeholder="U"
                        maxLength={1}
                      />
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                        {editedProfile.avatar || '?'}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Choose a letter for your avatar
                    </p>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <button
                    onClick={handleCancel}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn btn-primary flex-1"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="card">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                Your Statistics
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    247
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Tasks Completed
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    12
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Day Streak
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    18
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Templates Created
                  </div>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    5
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Shared Plans
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="card">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      Email Notifications
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Receive email updates about your tasks
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      Push Notifications
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Get notified about upcoming tasks
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      Weekly Summary
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Receive weekly productivity reports
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card border-2 border-red-200 dark:border-red-800">
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-6">
                Danger Zone
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      Delete Account
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Permanently delete your account and all data
                    </div>
                  </div>
                  <button className="btn bg-red-600 hover:bg-red-700 text-white border-0">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  )
}
