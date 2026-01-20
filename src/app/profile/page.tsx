'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Toast } from '@/components/ui/toast/Toast'
import { useRouter } from 'next/navigation'
import { getTasks } from '@/lib/storage/tasks'
import { getTemplates } from '@/lib/storage/templates'
import { SearchIcon, UserIcon, XIcon } from '@/components/icons'
import { dispatchProfileUpdate } from '@/lib/events/profileEvents'

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    avatarType: 'initial' as 'initial' | 'photo',
    avatarUrl: '',
    joinDate: new Date(),
  })

  const [statistics, setStatistics] = useState({
    tasksCompleted: 0,
    dayStreak: 0,
    templatesCreated: 0,
    sharedPlans: 0,
  })

  const [editedProfile, setEditedProfile] = useState(profile)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Friends state
  const [searchQuery, setSearchQuery] = useState('')
  const [friends, setFriends] = useState<any[]>([])
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Fetch user session on mount
  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await fetch('/api/auth')
        if (response.ok) {
          const data = await response.json()
          const user = data.user
          const userProfile = {
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            bio: user.bio || '',
            avatar: user.avatar || (user.displayName || user.email)?.[0]?.toUpperCase() || 'U',
            avatarType: (user.avatarType || 'initial') as 'initial' | 'photo',
            avatarUrl: user.avatarType === 'photo' ? user.avatar : '',
            joinDate: new Date(user.createdAt || Date.now()),
          }
          setProfile(userProfile)
          setEditedProfile(userProfile)
        }
      } catch (error) {
        console.error('Failed to fetch user session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserSession()
  }, [])

  // Calculate statistics from localStorage
  useEffect(() => {
    const calculateStatistics = () => {
      const tasks = getTasks()
      const templates = getTemplates()

      const completedTasks = tasks.filter(t => t.status === 'completed').length

      // Calculate streak (simplified - just showing days with completed tasks in last 30 days)
      const today = new Date()
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        return date.toDateString()
      })

      let streak = 0
      for (const dateStr of last30Days) {
        const hasCompletedTask = tasks.some(t => {
          if (t.status !== 'completed' || !t.updatedAt) return false
          return new Date(t.updatedAt).toDateString() === dateStr
        })
        if (hasCompletedTask) {
          streak++
        } else {
          break
        }
      }

      setStatistics({
        tasksCompleted: completedTasks,
        dayStreak: streak,
        templatesCreated: templates.length,
        sharedPlans: 0, // Shared plans aren't implemented yet
      })
    }

    calculateStatistics()
  }, [])

  const handleSave = async () => {
    if (!editedProfile.name.trim()) {
      setToast({ message: 'Name cannot be empty', type: 'error' })
      return
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: editedProfile.name,
          bio: editedProfile.bio,
          avatar: editedProfile.avatarUrl || editedProfile.avatar,
          avatarType: editedProfile.avatarType,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(editedProfile)
        setIsEditing(false)

        // Update localStorage so mini-profile reflects changes
        try {
          const userDataStr = localStorage.getItem('user')
          if (userDataStr) {
            const userData = JSON.parse(userDataStr)
            userData.displayName = editedProfile.name
            userData.bio = editedProfile.bio
            userData.avatar = editedProfile.avatarUrl || editedProfile.avatar
            userData.avatarType = editedProfile.avatarType
            localStorage.setItem('user', JSON.stringify(userData))
          }
        } catch (error) {
          console.error('Error updating user in localStorage:', error)
        }

        // Dispatch custom event to instantly update all profile components
        dispatchProfileUpdate({
          displayName: editedProfile.name,
          avatar: editedProfile.avatarUrl || editedProfile.avatar,
          avatarType: editedProfile.avatarType,
        })

        setToast({ message: 'Profile updated successfully!', type: 'success' })
      } else {
        const errorData = await response.json()
        setToast({ message: errorData.error || 'Failed to update profile', type: 'error' })
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setToast({ message: 'Failed to update profile. Please try again.', type: 'error' })
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleAvatarChange = (letter: string) => {
    setEditedProfile({ ...editedProfile, avatar: letter.toUpperCase() })
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Image must be smaller than 5MB', type: 'error' })
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please upload an image file', type: 'error' })
      return
    }

    // Read and preview the image
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPhotoPreview(result)
      setEditedProfile({
        ...editedProfile,
        avatarType: 'photo',
        avatarUrl: result,
      })
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhotoPreview(null)
    setEditedProfile({
      ...editedProfile,
      avatarType: 'initial',
      avatarUrl: '',
    })
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
      })

      if (response.ok) {
        localStorage.clear()
        router.push('/')
      } else {
        setToast({ message: 'Failed to delete account. Please try again.', type: 'error' })
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      setToast({ message: 'An error occurred. Please try again.', type: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  // Friends functionality
  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    // Simulate API call - in real app this would search actual users
    setTimeout(() => {
      // Mock search results
      const mockResults = [
        {
          id: '2',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'J',
          isFriend: false,
          requestPending: false,
        },
        {
          id: '3',
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar: 'J',
          isFriend: false,
          requestPending: false,
        },
      ].filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(mockResults)
      setIsSearching(false)
    }, 500)
  }

  const handleSendFriendRequest = (userId: string) => {
    setSearchResults(searchResults.map(user =>
      user.id === userId ? { ...user, requestPending: true } : user
    ))
    setToast({ message: 'Friend request sent!', type: 'success' })
  }

  const handleAcceptFriendRequest = (userId: string) => {
    const request = friendRequests.find(r => r.id === userId)
    if (request) {
      setFriends([...friends, { ...request, isFriend: true }])
      setFriendRequests(friendRequests.filter(r => r.id !== userId))
      setToast({ message: 'Friend request accepted!', type: 'success' })
    }
  }

  const handleRemoveFriend = (userId: string) => {
    setFriends(friends.filter(f => f.id !== userId))
    setToast({ message: 'Friend removed', type: 'success' })
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearchUsers()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="flex items-center justify-center h-96">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </DashboardLayout>
    )
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
              <div className="relative w-32 h-32 mx-auto mb-4">
                {(isEditing ? editedProfile.avatarType === 'photo' : profile.avatarType === 'photo') &&
                 (isEditing ? editedProfile.avatarUrl : profile.avatarUrl) ? (
                  <img
                    src={isEditing ? editedProfile.avatarUrl : profile.avatarUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-blue-600"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-5xl">
                    {isEditing ? editedProfile.avatar : profile.avatar}
                  </div>
                )}
                {isEditing && (
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer text-white shadow-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
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
                    <label className="label">Profile Picture</label>
                    <div className="space-y-4">
                      {editedProfile.avatarType === 'photo' && editedProfile.avatarUrl ? (
                        <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                          <img
                            src={editedProfile.avatarUrl}
                            alt="Preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-blue-600"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                              Profile photo uploaded
                            </p>
                            <p className="text-xs text-neutral-500">
                              Click the camera icon above to change
                            </p>
                          </div>
                          <button
                            onClick={removePhoto}
                            className="btn btn-secondary btn-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
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
                            Choose a letter for your avatar, or upload a photo using the camera icon above
                          </p>
                        </div>
                      )}
                    </div>
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
                    {statistics.tasksCompleted}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Tasks Completed
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {statistics.dayStreak}
                    {statistics.dayStreak > 0 && '🔥'}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Day Streak
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {statistics.templatesCreated}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Templates Created
                  </div>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    {statistics.sharedPlans}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Shared Plans
                  </div>
                </div>
              </div>
            </div>

            {/* Friends */}
            <div className="card">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                Friends
              </h3>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="input pl-10"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="loading-spinner w-5 h-5"></div>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 max-h-60 overflow-y-auto">
                    {searchResults.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-700 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                              {user.name}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        {user.requestPending ? (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 px-3 py-1 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                            Request Sent
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendFriendRequest(user.id)}
                            className="btn btn-primary btn-sm"
                          >
                            Add Friend
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery && !isSearching && searchResults.length === 0 && (
                  <div className="mt-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center text-neutral-500 dark:text-neutral-400 text-sm">
                    No users found matching "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Friend Requests */}
              {friendRequests.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Friend Requests
                  </h4>
                  <div className="space-y-2">
                    {friendRequests.map(request => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {request.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                              {request.name}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {request.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptFriendRequest(request.id)}
                            className="btn btn-primary btn-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => setFriendRequests(friendRequests.filter(r => r.id !== request.id))}
                            className="btn btn-ghost btn-sm"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friends List */}
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Your Friends ({friends.length})
                </h4>
                {friends.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 text-sm">
                    No friends yet. Search for users above to add friends!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map(friend => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {friend.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                              {friend.name}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {friend.email}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="btn bg-red-600 hover:bg-red-700 text-white border-0"
                  >
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
