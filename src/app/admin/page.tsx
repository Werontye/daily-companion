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

interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  avatarType: 'initial' | 'photo'
  bio?: string
  isCreator: boolean
  isAdmin: boolean
  isBanned: boolean
  banReason?: string
  bannedAt?: string
  warnings: Warning[]
  createdAt: string
  lastLogin?: string
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          View
                        </button>

                        {/* Creator-only actions for managing admins */}
                        {currentUser?.isCreator && !user.isCreator && (
                          <>
                            {user.isAdmin ? (
                              <button
                                onClick={() => handleAction(user.id, 'removeAdmin')}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                Remove Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(user.id, 'makeAdmin')}
                                className="text-green-600 hover:text-green-700"
                              >
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
                              className="text-yellow-600 hover:text-yellow-700"
                            >
                              Warn
                            </button>
                            {user.isBanned ? (
                              <button
                                onClick={() => handleAction(user.id, 'unban')}
                                className="text-green-600 hover:text-green-700"
                              >
                                Unban
                              </button>
                            ) : (
                              <button
                                onClick={() => setActionModal({ type: 'ban', user })}
                                className="text-red-600 hover:text-red-700"
                              >
                                Ban
                              </button>
                            )}
                            <button
                              onClick={() => setActionModal({ type: 'delete', user })}
                              className="text-red-600 hover:text-red-700"
                            >
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
