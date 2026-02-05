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
    socialLinks: {
      twitter: '',
      instagram: '',
      telegram: '',
      github: '',
      website: '',
    },
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

  // Fetch user session and friends on mount
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
            socialLinks: {
              twitter: user.socialLinks?.twitter || '',
              instagram: user.socialLinks?.instagram || '',
              telegram: user.socialLinks?.telegram || '',
              github: user.socialLinks?.github || '',
              website: user.socialLinks?.website || '',
            },
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

    const fetchFriends = async () => {
      try {
        const response = await fetch('/api/friends')
        if (response.ok) {
          const data = await response.json()
          setFriends(data.friends.map((f: any) => ({
            id: f.id,
            name: f.displayName,
            email: f.email,
            avatar: f.avatarType === 'photo' ? null : (f.avatar || f.displayName?.[0]?.toUpperCase() || 'U'),
            avatarUrl: f.avatarType === 'photo' ? f.avatar : null,
            avatarType: f.avatarType,
          })))
          setFriendRequests((data.pendingRequests || []).map((r: any) => ({
            id: r.id,
            friendshipId: r.friendshipId,
            name: r.displayName,
            email: r.email,
            avatar: r.avatarType === 'photo' ? null : (r.avatar || r.displayName?.[0]?.toUpperCase() || 'U'),
            avatarUrl: r.avatarType === 'photo' ? r.avatar : null,
            avatarType: r.avatarType,
          })))
        }
      } catch (error) {
        console.error('Failed to fetch friends:', error)
      }
    }

    fetchUserSession()
    fetchFriends()
  }, [])

  // Calculate statistics from localStorage and API
  useEffect(() => {
    const calculateStatistics = async () => {
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

      // Fetch shared plans count
      let sharedPlansCount = 0
      try {
        const response = await fetch('/api/shared-plans')
        if (response.ok) {
          const data = await response.json()
          sharedPlansCount = data.plans?.length || 0
        }
      } catch (error) {
        console.error('Failed to fetch shared plans count:', error)
      }

      setStatistics({
        tasksCompleted: completedTasks,
        dayStreak: streak,
        templatesCreated: templates.length,
        sharedPlans: sharedPlansCount,
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
          socialLinks: editedProfile.socialLinks,
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
            userData.socialLinks = editedProfile.socialLinks
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
    try {
      const response = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users.map((user: any) => ({
          id: user.id,
          name: user.displayName,
          email: user.email,
          avatar: user.avatarType === 'photo' ? null : (user.avatar || user.displayName?.[0]?.toUpperCase() || 'U'),
          avatarUrl: user.avatarType === 'photo' ? user.avatar : null,
          avatarType: user.avatarType,
          isFriend: user.isFriend,
          requestPending: user.requestPending,
          requestReceived: user.requestReceived,
        })))
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: userId }),
      })

      if (response.ok) {
        setSearchResults(searchResults.map(user =>
          user.id === userId ? { ...user, requestPending: true } : user
        ))
        setToast({ message: 'Friend request sent!', type: 'success' })
      } else {
        const data = await response.json()
        setToast({ message: data.error || 'Failed to send request', type: 'error' })
      }
    } catch (error) {
      console.error('Failed to send friend request:', error)
      setToast({ message: 'Failed to send friend request', type: 'error' })
    }
  }

  const handleAcceptFriendRequest = async (userId: string) => {
    const request = friendRequests.find(r => r.id === userId)
    if (!request) return

    try {
      const response = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId: request.friendshipId, action: 'accept' }),
      })

      if (response.ok) {
        setFriends([...friends, { ...request, isFriend: true }])
        setFriendRequests(friendRequests.filter(r => r.id !== userId))
        setToast({ message: 'Friend request accepted!', type: 'success' })
      } else {
        const data = await response.json()
        setToast({ message: data.error || 'Failed to accept request', type: 'error' })
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error)
      setToast({ message: 'Failed to accept friend request', type: 'error' })
    }
  }

  const handleDeclineFriendRequest = async (userId: string) => {
    const request = friendRequests.find(r => r.id === userId)
    if (!request) return

    try {
      const response = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId: request.friendshipId, action: 'decline' }),
      })

      if (response.ok) {
        setFriendRequests(friendRequests.filter(r => r.id !== userId))
        setToast({ message: 'Friend request declined', type: 'success' })
      } else {
        const data = await response.json()
        setToast({ message: data.error || 'Failed to decline request', type: 'error' })
      }
    } catch (error) {
      console.error('Failed to decline friend request:', error)
      setToast({ message: 'Failed to decline friend request', type: 'error' })
    }
  }

  const handleRemoveFriend = async (userId: string) => {
    try {
      const response = await fetch(`/api/friends?friendId=${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFriends(friends.filter(f => f.id !== userId))
        setToast({ message: 'Friend removed', type: 'success' })
      } else {
        const data = await response.json()
        setToast({ message: data.error || 'Failed to remove friend', type: 'error' })
      }
    } catch (error) {
      console.error('Failed to remove friend:', error)
      setToast({ message: 'Failed to remove friend', type: 'error' })
    }
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

            {/* Social Links */}
            <div className="card">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                Social Links
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="label flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter / X
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.socialLinks.twitter}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        socialLinks: { ...editedProfile.socialLinks, twitter: e.target.value }
                      })}
                      className="input"
                      placeholder="https://twitter.com/username"
                    />
                  ) : (
                    profile.socialLinks.twitter ? (
                      <a
                        href={profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {profile.socialLinks.twitter}
                      </a>
                    ) : (
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm">Not set</p>
                    )
                  )}
                </div>

                <div>
                  <label className="label flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                    </svg>
                    Instagram
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.socialLinks.instagram}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        socialLinks: { ...editedProfile.socialLinks, instagram: e.target.value }
                      })}
                      className="input"
                      placeholder="https://instagram.com/username"
                    />
                  ) : (
                    profile.socialLinks.instagram ? (
                      <a
                        href={profile.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {profile.socialLinks.instagram}
                      </a>
                    ) : (
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm">Not set</p>
                    )
                  )}
                </div>

                <div>
                  <label className="label flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#0088cc]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.socialLinks.telegram}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        socialLinks: { ...editedProfile.socialLinks, telegram: e.target.value }
                      })}
                      className="input"
                      placeholder="https://t.me/username"
                    />
                  ) : (
                    profile.socialLinks.telegram ? (
                      <a
                        href={profile.socialLinks.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {profile.socialLinks.telegram}
                      </a>
                    ) : (
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm">Not set</p>
                    )
                  )}
                </div>

                <div>
                  <label className="label flex items-center gap-2">
                    <svg className="w-5 h-5 text-neutral-900 dark:text-neutral-100" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.socialLinks.github}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        socialLinks: { ...editedProfile.socialLinks, github: e.target.value }
                      })}
                      className="input"
                      placeholder="https://github.com/username"
                    />
                  ) : (
                    profile.socialLinks.github ? (
                      <a
                        href={profile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {profile.socialLinks.github}
                      </a>
                    ) : (
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm">Not set</p>
                    )
                  )}
                </div>

                <div>
                  <label className="label flex items-center gap-2">
                    <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.socialLinks.website}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        socialLinks: { ...editedProfile.socialLinks, website: e.target.value }
                      })}
                      className="input"
                      placeholder="https://yourwebsite.com"
                    />
                  ) : (
                    profile.socialLinks.website ? (
                      <a
                        href={profile.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {profile.socialLinks.website}
                      </a>
                    ) : (
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm">Not set</p>
                    )
                  )}
                </div>
              </div>
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
                          {user.avatarType === 'photo' && user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {user.avatar}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                              {user.name}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        {user.isFriend ? (
                          <span className="text-xs text-green-600 dark:text-green-400 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                            Friends
                          </span>
                        ) : user.requestPending ? (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 px-3 py-1 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                            Request Sent
                          </span>
                        ) : user.requestReceived ? (
                          <span className="text-xs text-blue-600 dark:text-blue-400 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            Pending
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
                    Friend Requests ({friendRequests.length})
                  </h4>
                  <div className="space-y-2">
                    {friendRequests.map(request => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-center gap-3">
                          {request.avatarType === 'photo' && request.avatarUrl ? (
                            <img
                              src={request.avatarUrl}
                              alt={request.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {request.avatar}
                            </div>
                          )}
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
                            onClick={() => handleDeclineFriendRequest(request.id)}
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
                          {friend.avatarType === 'photo' && friend.avatarUrl ? (
                            <img
                              src={friend.avatarUrl}
                              alt={friend.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {friend.avatar}
                            </div>
                          )}
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
