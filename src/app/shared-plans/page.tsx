'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { PlusIcon, UserGroupIcon, CheckCircleIcon, XIcon, SearchIcon } from '@/components/icons'
import { GlobalMessenger } from '@/components/messenger/GlobalMessenger'
import { Toast } from '@/components/ui/toast/Toast'

interface Member {
  id: string
  displayName: string
  avatar: string
  avatarType: string
  email?: string
  role: 'owner' | 'editor' | 'viewer'
  joinedAt?: string
}

interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  assignedTo?: {
    id: string
    displayName: string
    avatar: string
    avatarType: string
  } | null
  createdBy: {
    id: string
    displayName: string
    avatar: string
    avatarType: string
  }
  createdAt: string
  completedAt?: string
}

interface Message {
  id: string
  sender: {
    id: string
    displayName: string
    avatar: string
    avatarType: string
  }
  content: string
  createdAt: string
}

interface SharedPlan {
  id: string
  name: string
  description: string
  owner: Member
  members: Member[]
  tasks: Task[]
  taskCount?: number
  completedTaskCount?: number
  userRole: 'owner' | 'editor' | 'viewer'
  createdAt: string
  updatedAt: string
}

interface Invitation {
  id: string
  planId: string
  planName: string
  invitedBy: {
    id: string
    displayName: string
    avatar: string
    avatarType: string
  }
  role: 'editor' | 'viewer'
  createdAt: string
}

export default function SharedPlansPage() {
  const [plans, setPlans] = useState<SharedPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<SharedPlan | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)

  // Form states
  const [newPlanName, setNewPlanName] = useState('')
  const [newPlanDescription, setNewPlanDescription] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState('')

  // Invite states
  const [friendSearchQuery, setFriendSearchQuery] = useState('')
  const [friendSearchResults, setFriendSearchResults] = useState<any[]>([])
  const [isSearchingFriends, setIsSearchingFriends] = useState(false)
  const [selectedInviteRole, setSelectedInviteRole] = useState<'editor' | 'viewer'>('editor')

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch('/api/shared-plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans || [])
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    }
  }, [])

  // Fetch invitations
  const fetchInvitations = useCallback(async () => {
    try {
      const response = await fetch('/api/shared-plans/invitations')
      if (response.ok) {
        const data = await response.json()
        setInvitations(data.invitations || [])
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error)
    }
  }, [])

  // Fetch plan details
  const fetchPlanDetails = useCallback(async (planId: string) => {
    try {
      const response = await fetch(`/api/shared-plans/${planId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedPlan(data.plan)
      }
    } catch (error) {
      console.error('Failed to fetch plan details:', error)
    }
  }, [])

  // Fetch messages for selected plan
  const fetchMessages = useCallback(async (planId: string) => {
    try {
      const response = await fetch(`/api/shared-plans/${planId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchPlans(), fetchInvitations()])
      setIsLoading(false)
    }
    loadData()
  }, [fetchPlans, fetchInvitations])

  // Poll for new messages every 5 seconds when plan is selected
  useEffect(() => {
    if (selectedPlan) {
      const interval = setInterval(() => {
        fetchMessages(selectedPlan.id)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedPlan, fetchMessages])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Search friends for invite
  useEffect(() => {
    const searchFriends = async () => {
      if (!friendSearchQuery.trim()) {
        setFriendSearchResults([])
        return
      }

      setIsSearchingFriends(true)
      try {
        const response = await fetch(`/api/friends/search?q=${encodeURIComponent(friendSearchQuery)}`)
        if (response.ok) {
          const data = await response.json()
          // Filter out users who are already members
          const memberIds = selectedPlan ? [selectedPlan.owner.id, ...selectedPlan.members.map(m => m.id)] : []
          setFriendSearchResults(data.users.filter((u: any) => u.isFriend && !memberIds.includes(u.id)))
        }
      } catch (error) {
        console.error('Failed to search friends:', error)
      } finally {
        setIsSearchingFriends(false)
      }
    }

    const timeoutId = setTimeout(searchFriends, 300)
    return () => clearTimeout(timeoutId)
  }, [friendSearchQuery, selectedPlan])

  const handleSelectPlan = async (plan: SharedPlan) => {
    await fetchPlanDetails(plan.id)
    await fetchMessages(plan.id)
  }

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) return

    try {
      const response = await fetch('/api/shared-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlanName.trim(),
          description: newPlanDescription.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPlans(prev => [data.plan, ...prev])
        setSelectedPlan(data.plan)
        setMessages([])
        setNewPlanName('')
        setNewPlanDescription('')
        setShowCreateModal(false)
        setToast({ message: 'Plan created successfully!', type: 'success' })
      } else {
        const error = await response.json()
        setToast({ message: error.error || 'Failed to create plan', type: 'error' })
      }
    } catch (error) {
      console.error('Failed to create plan:', error)
      setToast({ message: 'Failed to create plan', type: 'error' })
    }
  }

  const handleInviteMember = async (userId: string) => {
    if (!selectedPlan) return

    try {
      const response = await fetch(`/api/shared-plans/${selectedPlan.id}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          role: selectedInviteRole,
        }),
      })

      if (response.ok) {
        setToast({ message: 'Invitation sent!', type: 'success' })
        setFriendSearchQuery('')
        setFriendSearchResults([])
        setShowInviteModal(false)
      } else {
        const error = await response.json()
        setToast({ message: error.error || 'Failed to send invitation', type: 'error' })
      }
    } catch (error) {
      console.error('Failed to invite member:', error)
      setToast({ message: 'Failed to send invitation', type: 'error' })
    }
  }

  const handleRespondToInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch('/api/shared-plans/invitations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId, action }),
      })

      if (response.ok) {
        setInvitations(prev => prev.filter(i => i.id !== invitationId))
        if (action === 'accept') {
          await fetchPlans()
          setToast({ message: 'Invitation accepted!', type: 'success' })
        } else {
          setToast({ message: 'Invitation declined', type: 'success' })
        }
      } else {
        const error = await response.json()
        setToast({ message: error.error || 'Failed to respond to invitation', type: 'error' })
      }
    } catch (error) {
      console.error('Failed to respond to invitation:', error)
      setToast({ message: 'Failed to respond to invitation', type: 'error' })
    }
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedPlan) return

    try {
      const response = await fetch(`/api/shared-plans/${selectedPlan.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || undefined,
          assignedTo: newTaskAssignee || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedPlan(prev => prev ? {
          ...prev,
          tasks: [...prev.tasks, data.task],
        } : null)
        setNewTaskTitle('')
        setNewTaskDescription('')
        setNewTaskAssignee('')
        setShowAddTaskModal(false)
        setToast({ message: 'Task added!', type: 'success' })
      } else {
        const error = await response.json()
        setToast({ message: error.error || 'Failed to add task', type: 'error' })
      }
    } catch (error) {
      console.error('Failed to add task:', error)
      setToast({ message: 'Failed to add task', type: 'error' })
    }
  }

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    if (!selectedPlan) return

    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'

    try {
      const response = await fetch(`/api/shared-plans/${selectedPlan.id}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus }),
      })

      if (response.ok) {
        setSelectedPlan(prev => prev ? {
          ...prev,
          tasks: prev.tasks.map(t =>
            t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t
          ),
        } : null)
      } else {
        const error = await response.json()
        setToast({ message: error.error || 'Failed to update task', type: 'error' })
      }
    } catch (error) {
      console.error('Failed to toggle task status:', error)
      setToast({ message: 'Failed to update task', type: 'error' })
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedPlan || isSending) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/shared-plans/${selectedPlan.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageInput.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.message])
        setMessageInput('')
      } else {
        const error = await response.json()
        setToast({ message: error.error || 'Failed to send message', type: 'error' })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setToast({ message: 'Failed to send message', type: 'error' })
    } finally {
      setIsSending(false)
    }
  }

  const renderAvatar = (user: { displayName: string; avatar: string; avatarType: string } | null, size: 'sm' | 'md' = 'md') => {
    if (!user) return null
    const sizeClasses = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'

    if (user.avatarType === 'photo' && user.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.displayName}
          className={`${sizeClasses} rounded-full object-cover`}
        />
      )
    }

    return (
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold`}>
        {user.avatar || user.displayName?.[0]?.toUpperCase() || 'U'}
      </div>
    )
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const canEdit = selectedPlan?.userRole === 'owner' || selectedPlan?.userRole === 'editor'

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="loading-spinner"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                Shared Plans
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                Collaborate with others on shared task lists
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Create Shared Plan
            </button>
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                Pending Invitations ({invitations.length})
              </h3>
              <div className="space-y-2">
                {invitations.map(invitation => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {renderAvatar(invitation.invitedBy)}
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {invitation.planName}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Invited by {invitation.invitedBy.displayName} as {invitation.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespondToInvitation(invitation.id, 'accept')}
                        className="btn btn-primary btn-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondToInvitation(invitation.id, 'decline')}
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans List */}
          <div className="lg:col-span-1 space-y-4">
            {plans.length === 0 ? (
              <div className="card text-center py-12">
                <UserGroupIcon className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  No shared plans yet.<br />
                  Create one to get started!
                </p>
              </div>
            ) : (
              plans.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  className={`card cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id
                      ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:shadow-lg'
                  }`}
                >
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                    {plan.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <UserGroupIcon className="h-4 w-4 text-neutral-500" />
                    <div className="flex -space-x-2">
                      {renderAvatar(plan.owner, 'sm')}
                      {plan.members.slice(0, 3).map(member => (
                        <div key={member.id} className="-ml-2">
                          {renderAvatar(member, 'sm')}
                        </div>
                      ))}
                      {plan.members.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs -ml-2">
                          +{plan.members.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{plan.completedTaskCount || 0}/{plan.taskCount || 0} tasks</span>
                    <span className="capitalize">{plan.userRole}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Plan Details & Chat */}
          {selectedPlan ? (
            <div className="lg:col-span-2 space-y-6">
              {/* Plan Header */}
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedPlan.name}
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                      {selectedPlan.description || 'No description'}
                    </p>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="btn btn-secondary btn-sm"
                    >
                      Invite Members
                    </button>
                  )}
                </div>

                {/* Members */}
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Members:
                  </span>
                  <div className="flex items-center gap-2">
                    {renderAvatar(selectedPlan.owner)}
                    <div>
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {selectedPlan.owner.displayName}
                      </div>
                      <div className="text-xs text-neutral-500 capitalize">owner</div>
                    </div>
                  </div>
                  {selectedPlan.members.map(member => (
                    <div key={member.id} className="flex items-center gap-2">
                      {renderAvatar(member)}
                      <div>
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {member.displayName}
                        </div>
                        <div className="text-xs text-neutral-500 capitalize">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Tasks ({selectedPlan.tasks.filter(t => t.status === 'completed').length}/{selectedPlan.tasks.length})
                </h3>
                <div className="space-y-2">
                  {selectedPlan.tasks.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                      No tasks yet. Add your first task!
                    </div>
                  ) : (
                    selectedPlan.tasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                      >
                        <button
                          onClick={() => handleToggleTaskStatus(task.id, task.status)}
                          className="focus:outline-none"
                          disabled={!canEdit}
                        >
                          <CheckCircleIcon
                            className={`h-5 w-5 ${
                              task.status === 'completed'
                                ? 'text-green-600'
                                : 'text-neutral-300 dark:text-neutral-600 hover:text-green-400'
                            } ${!canEdit ? 'cursor-not-allowed' : ''}`}
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <span
                            className={`${
                              task.status === 'completed'
                                ? 'line-through text-neutral-500'
                                : 'text-neutral-900 dark:text-neutral-100'
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.description && (
                            <p className="text-xs text-neutral-500 mt-1 truncate">
                              {task.description}
                            </p>
                          )}
                        </div>
                        {task.assignedTo && (
                          <div className="flex items-center gap-1 text-xs text-neutral-500">
                            {renderAvatar(task.assignedTo, 'sm')}
                            <span className="hidden sm:inline">{task.assignedTo.displayName}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {canEdit && (
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="btn btn-secondary w-full mt-4"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Task
                  </button>
                )}
              </div>

              {/* Chat */}
              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Discussion
                </h3>

                {/* Messages */}
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map(message => (
                      <div key={message.id} className="flex gap-3">
                        {renderAvatar(message.sender)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                              {message.sender.displayName}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-2 break-words">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type a message..."
                    className="input flex-1"
                    disabled={isSending}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="btn btn-primary"
                    disabled={!messageInput.trim() || isSending}
                  >
                    {isSending ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center card min-h-96">
              <div className="text-center text-neutral-500 dark:text-neutral-400">
                <UserGroupIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a plan to view details and chat</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Messenger */}
      <GlobalMessenger />

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Create Shared Plan
            </h2>

            <div className="space-y-4">
              <div>
                <label className="label">Plan Name</label>
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="e.g., Team Project, Family Tasks"
                  className="input w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Description (optional)</label>
                <textarea
                  value={newPlanDescription}
                  onChange={(e) => setNewPlanDescription(e.target.value)}
                  placeholder="What's this plan about?"
                  className="input w-full h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewPlanName('')
                    setNewPlanDescription('')
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlan}
                  disabled={!newPlanName.trim()}
                  className="btn btn-primary flex-1"
                >
                  Create Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Invite Members
              </h2>
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setFriendSearchQuery('')
                  setFriendSearchResults([])
                }}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Search Friends</label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={friendSearchQuery}
                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="input w-full pl-10"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="label">Role</label>
                <select
                  value={selectedInviteRole}
                  onChange={(e) => setSelectedInviteRole(e.target.value as 'editor' | 'viewer')}
                  className="input w-full"
                >
                  <option value="editor">Editor - Can add tasks and invite others</option>
                  <option value="viewer">Viewer - Read-only access</option>
                </select>
              </div>

              {/* Search Results */}
              {isSearchingFriends ? (
                <div className="text-center py-4">
                  <div className="loading-spinner"></div>
                </div>
              ) : friendSearchResults.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {friendSearchResults.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {user.avatarType === 'photo' && user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {user.avatar}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                            {user.name}
                          </div>
                          <div className="text-xs text-neutral-500">{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleInviteMember(user.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              ) : friendSearchQuery && !isSearchingFriends ? (
                <div className="text-center py-4 text-neutral-500 dark:text-neutral-400 text-sm">
                  No friends found. Add friends from your profile to invite them.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Add Task
            </h2>

            <div className="space-y-4">
              <div>
                <label className="label">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className="input w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Description (optional)</label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Add more details..."
                  className="input w-full h-20 resize-none"
                />
              </div>

              <div>
                <label className="label">Assign To (optional)</label>
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Unassigned</option>
                  <option value={selectedPlan?.owner.id}>{selectedPlan?.owner.displayName}</option>
                  {selectedPlan?.members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddTaskModal(false)
                    setNewTaskTitle('')
                    setNewTaskDescription('')
                    setNewTaskAssignee('')
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                  className="btn btn-primary flex-1"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
