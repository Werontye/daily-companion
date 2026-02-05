'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon } from '@/components/icons'

interface Warning {
  reason: string
  issuedBy: string
  issuedAt: string
}

interface SocialLinks {
  twitter?: string
  instagram?: string
  telegram?: string
  github?: string
  website?: string
}

interface User {
  id: string
  username: string
  displayName: string
  email?: string
  avatar: string
  avatarType: 'initial' | 'photo'
  bio?: string
  socialLinks?: SocialLinks
  isCreator: boolean
  isAdmin: boolean
  isBanned: boolean
  banReason?: string
  bannedAt?: string
  warnings: Warning[]
  createdAt: string
  lastLogin?: string
  friendsCount: number
  publicTemplatesCount: number
}

interface CurrentUser {
  isCreator: boolean
  isAdmin: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionModal, setActionModal] = useState<{ type: 'warn' | 'ban' | 'delete' | 'makeAdmin' | 'removeAdmin' | null; user: User | null }>({ type: null, user: null })
  const [actionReason, setActionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (response.status === 403) {
        // Try to become admin/creator if none exist
        const setupResponse = await fetch('/api/admin/setup', { method: 'POST' })
        const setupData = await setupResponse.json()

        if (setupResponse.ok && (setupData.isAdmin || setupData.isCreator)) {
          setSuccessMessage(setupData.message)
          setTimeout(() => setSuccessMessage(''), 5000)
          const retryResponse = await fetch('/api/admin/users')
          const retryData = await retryResponse.json()
          if (retryResponse.ok) {
            setUsers(retryData.users)
            setCurrentUser(retryData.currentUser)
            setLoading(false)
            return
          }
        }

        router.push('/dashboard')
        return
      }

      if (response.ok) {
        setUsers(data.users)
        setCurrentUser(data.currentUser)
      } else {
        setError(data.error || 'Failed to fetch users')
      }
    } catch (err) {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (userId: string, action: string, reason?: string) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage(data.message)
        fetchUsers()
        setActionModal({ type: null, user: null })
        setActionReason('')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.error || 'Action failed')
        setTimeout(() => setError(''), 5000)
      }
    } catch (err) {
      setError('Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage(data.message)
        fetchUsers()
        setActionModal({ type: null, user: null })
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.error || 'Delete failed')
        setTimeout(() => setError(''), 5000)
      }
    } catch (err) {
      setError('Delete failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCleanupUsers = async () => {
    if (!confirm('Are you sure you want to delete ALL users except Creator? This cannot be undone!')) {
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage(data.message)
        fetchUsers()
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.error || 'Cleanup failed')
        setTimeout(() => setError(''), 5000)
      }
    } catch (err) {
      setError('Cleanup failed')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  const getRoleBadge = (user: User) => {
    if (user.isCreator) {
      return <span className="ml-2 text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full font-semibold">Creator</span>
    }
    if (user.isAdmin) {
      return <span className="ml-2 text-xs text-primary-600 bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">Admin</span>
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <CheckCircleIcon className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </Link>
              {currentUser?.isCreator && (
                <span className="text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full font-semibold">
                  Creator Mode
                </span>
              )}
            </div>
            <Link
              href="/dashboard"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl"
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl"
            >
              {error}
              <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{users.length}</div>
            <div className="text-sm text-slate-500">Total Users</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-amber-600">{users.filter(u => u.isCreator).length}</div>
            <div className="text-sm text-slate-500">Creator</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.isAdmin && !u.isCreator).length}</div>
            <div className="text-sm text-slate-500">Admins</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-red-600">{users.filter(u => u.isBanned).length}</div>
            <div className="text-sm text-slate-500">Banned</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-yellow-600">{users.filter(u => u.warnings.length > 0).length}</div>
            <div className="text-sm text-slate-500">With Warnings</div>
          </div>
        </div>

        {/* Creator Actions */}
        {currentUser?.isCreator && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={handleCleanupUsers}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
            >
              Delete All (except Creator)
            </button>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Warnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Friends</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Templates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatarType === 'photo' ? (
                            <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                          ) : (
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
                              user.isCreator
                                ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                                : 'bg-gradient-to-br from-primary-500 to-accent-500'
                            }`}>
                              {user.avatar}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {user.displayName}
                          </div>
                          <div className="text-sm text-slate-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isCreator ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Creator
                        </span>
                      ) : user.isAdmin ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isBanned ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${user.warnings.length > 0 ? 'text-yellow-600 font-medium' : 'text-slate-500'}`}>
                        {user.warnings.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        {user.friendsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-purple-600 dark:text-purple-400">
                        {user.publicTemplatesCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>

                        {/* Creator-only actions for managing admins */}
                        {currentUser?.isCreator && !user.isCreator && (
                          <>
                            {user.isAdmin ? (
                              <button
                                onClick={() => handleAction(user.id, 'removeAdmin')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                                </svg>
                                Remove Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(user.id, 'makeAdmin')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Make Admin
                              </button>
                            )}
                          </>
                        )}

                        {/* Actions for non-admins OR creator can do anything */}
                        {(!user.isAdmin || currentUser?.isCreator) && !user.isCreator && (
                          <>
                            <button
                              onClick={() => setActionModal({ type: 'warn', user })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Warn
                            </button>
                            {user.isBanned ? (
                              <button
                                onClick={() => handleAction(user.id, 'unban')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Unban
                              </button>
                            ) : (
                              <button
                                onClick={() => setActionModal({ type: 'ban', user })}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Ban
                              </button>
                            )}
                            <button
                              onClick={() => setActionModal({ type: 'delete', user })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                  selectedUser.isCreator
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                    : 'bg-gradient-to-br from-primary-500 to-accent-500'
                }`}>
                  {selectedUser.avatar}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {selectedUser.displayName}
                    {getRoleBadge(selectedUser)}
                  </h2>
                  <p className="text-slate-500">@{selectedUser.username}</p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedUser.email && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Email</label>
                    <p className="text-slate-900 dark:text-slate-100">{selectedUser.email}</p>
                  </div>
                )}

                {selectedUser.bio && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Bio</label>
                    <p className="text-slate-900 dark:text-slate-100">{selectedUser.bio}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-slate-500">Status</label>
                  <p className="text-slate-900 dark:text-slate-100">
                    {selectedUser.isBanned ? `Banned: ${selectedUser.banReason}` : 'Active'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">Role</label>
                  <p className="text-slate-900 dark:text-slate-100">
                    {selectedUser.isCreator ? 'Creator (Owner)' : selectedUser.isAdmin ? 'Admin' : 'User'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">Friends</label>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold">{selectedUser.friendsCount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Public Templates</label>
                    <p className="text-purple-600 dark:text-purple-400 font-semibold">{selectedUser.publicTemplatesCount}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">Joined</label>
                  <p className="text-slate-900 dark:text-slate-100">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">Last Login</label>
                  <p className="text-slate-900 dark:text-slate-100">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>

                {/* Social Links */}
                {selectedUser.socialLinks && Object.values(selectedUser.socialLinks).some(v => v) && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Social Links</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedUser.socialLinks.twitter && (
                        <a href={selectedUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm text-[#1DA1F2] hover:bg-slate-200 dark:hover:bg-slate-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                          Twitter
                        </a>
                      )}
                      {selectedUser.socialLinks.instagram && (
                        <a href={selectedUser.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm text-[#E4405F] hover:bg-slate-200 dark:hover:bg-slate-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                          Instagram
                        </a>
                      )}
                      {selectedUser.socialLinks.telegram && (
                        <a href={selectedUser.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm text-[#0088cc] hover:bg-slate-200 dark:hover:bg-slate-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                          Telegram
                        </a>
                      )}
                      {selectedUser.socialLinks.github && (
                        <a href={selectedUser.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                          GitHub
                        </a>
                      )}
                      {selectedUser.socialLinks.website && (
                        <a href={selectedUser.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {selectedUser.warnings.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Warnings ({selectedUser.warnings.length})</label>
                    <div className="mt-2 space-y-2">
                      {selectedUser.warnings.map((warning, i) => (
                        <div key={i} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-sm">
                          <p className="text-yellow-800 dark:text-yellow-200">{warning.reason}</p>
                          <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                            By @{warning.issuedBy} on {new Date(warning.issuedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    {!selectedUser.isCreator && (
                      <button
                        onClick={() => {
                          handleAction(selectedUser.id, 'clearWarnings')
                          setSelectedUser(null)
                        }}
                        className="mt-2 text-sm text-yellow-600 hover:text-yellow-700"
                      >
                        Clear all warnings
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Modal */}
      <AnimatePresence>
        {actionModal.type && actionModal.user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setActionModal({ type: null, user: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                {actionModal.type === 'warn' && 'Issue Warning'}
                {actionModal.type === 'ban' && 'Ban User'}
                {actionModal.type === 'delete' && 'Delete User'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {actionModal.type === 'warn' && `Issue a warning to @${actionModal.user.username}`}
                {actionModal.type === 'ban' && `Ban @${actionModal.user.username} from the platform`}
                {actionModal.type === 'delete' && `Permanently delete @${actionModal.user.username}'s account`}
              </p>

              {(actionModal.type === 'warn' || actionModal.type === 'ban') && (
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={actionModal.type === 'warn' ? 'Warning reason...' : 'Ban reason...'}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                  rows={3}
                />
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setActionModal({ type: null, user: null })
                    setActionReason('')
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (actionModal.type === 'delete') {
                      handleDeleteUser(actionModal.user!.id)
                    } else {
                      handleAction(actionModal.user!.id, actionModal.type!, actionReason)
                    }
                  }}
                  disabled={actionLoading || ((actionModal.type === 'warn' || actionModal.type === 'ban') && !actionReason)}
                  className={`px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${
                    actionModal.type === 'delete' || actionModal.type === 'ban'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                >
                  {actionLoading ? 'Processing...' : actionModal.type === 'warn' ? 'Issue Warning' : actionModal.type === 'ban' ? 'Ban User' : 'Delete User'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
