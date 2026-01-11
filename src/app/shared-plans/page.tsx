'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { PlusIcon, UserGroupIcon, CheckCircleIcon } from '@/components/icons'
import { GlobalMessenger } from '@/components/messenger/GlobalMessenger'

interface Message {
  id: string
  userId: string
  userName: string
  avatar: string
  content: string
  timestamp: Date
}

interface SharedPlan {
  id: string
  name: string
  description: string
  members: Array<{
    id: string
    name: string
    avatar: string
    role: 'owner' | 'editor' | 'viewer'
  }>
  tasks: Array<{
    id: string
    title: string
    assignedTo?: string
    status: 'pending' | 'completed'
  }>
  messages: Message[]
  createdAt: Date
}

const demoPlans: SharedPlan[] = [
  {
    id: '1',
    name: 'Team Sprint Planning',
    description: 'Q1 2026 development sprint tasks',
    members: [
      { id: '1', name: 'You', avatar: '👤', role: 'owner' },
      { id: '2', name: 'Alice Chen', avatar: '👩', role: 'editor' },
      { id: '3', name: 'Bob Smith', avatar: '👨', role: 'editor' },
    ],
    tasks: [
      { id: 't1', title: 'Design new dashboard UI', assignedTo: '2', status: 'completed' },
      { id: 't2', title: 'Implement API endpoints', assignedTo: '3', status: 'pending' },
      { id: 't3', title: 'Write unit tests', assignedTo: '1', status: 'pending' },
    ],
    messages: [
      {
        id: 'm1',
        userId: '2',
        userName: 'Alice Chen',
        avatar: '👩',
        content: 'I finished the dashboard design! Check it out in Figma.',
        timestamp: new Date('2026-01-11T10:30:00'),
      },
      {
        id: 'm2',
        userId: '1',
        userName: 'You',
        avatar: '👤',
        content: 'Looks great! I\'ll start on the tests today.',
        timestamp: new Date('2026-01-11T11:00:00'),
      },
    ],
    createdAt: new Date('2026-01-08'),
  },
  {
    id: '2',
    name: 'Home Renovation',
    description: 'Living room makeover project',
    members: [
      { id: '1', name: 'You', avatar: '👤', role: 'owner' },
      { id: '4', name: 'Sarah Johnson', avatar: '👩‍🦰', role: 'editor' },
    ],
    tasks: [
      { id: 't4', title: 'Choose paint colors', assignedTo: '4', status: 'completed' },
      { id: 't5', title: 'Order furniture', assignedTo: '1', status: 'pending' },
    ],
    messages: [],
    createdAt: new Date('2026-01-05'),
  },
]

export default function SharedPlansPage() {
  const [plans, setPlans] = useState<SharedPlan[]>(demoPlans)
  const [selectedPlan, setSelectedPlan] = useState<SharedPlan | null>(null)
  const [messageInput, setMessageInput] = useState('')

  const handleSendMessage = (planId: string) => {
    if (!messageInput.trim()) return

    const newMessage: Message = {
      id: `m${Date.now()}`,
      userId: '1',
      userName: 'You',
      avatar: '👤',
      content: messageInput,
      timestamp: new Date(),
    }

    setPlans(plans.map(plan =>
      plan.id === planId
        ? { ...plan, messages: [...plan.messages, newMessage] }
        : plan
    ))

    if (selectedPlan?.id === planId) {
      setSelectedPlan({
        ...selectedPlan,
        messages: [...selectedPlan.messages, newMessage],
      })
    }

    setMessageInput('')
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
            <button className="btn btn-primary flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Create Shared Plan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans List */}
          <div className="lg:col-span-1 space-y-4">
            {plans.map(plan => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`card cursor-pointer transition-all ${
                  selectedPlan?.id === plan.id
                    ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:shadow-lg'
                }`}
              >
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  {plan.description}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <UserGroupIcon className="h-4 w-4 text-neutral-500" />
                  <div className="flex -space-x-2">
                    {plan.members.map(member => (
                      <div
                        key={member.id}
                        className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs border-2 border-white dark:border-neutral-800"
                        title={member.name}
                      >
                        {member.avatar}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{plan.tasks.filter(t => t.status === 'completed').length}/{plan.tasks.length} tasks</span>
                  {plan.messages.length > 0 && (
                    <span>{plan.messages.length} messages</span>
                  )}
                </div>
              </div>
            ))}
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
                      {selectedPlan.description}
                    </p>
                  </div>
                  <button className="btn btn-secondary btn-sm">
                    Invite Members
                  </button>
                </div>

                {/* Members */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Members:
                  </span>
                  {selectedPlan.members.map(member => (
                    <div key={member.id} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {member.name}
                        </div>
                        <div className="text-xs text-neutral-500 capitalize">
                          {member.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Tasks
                </h3>
                <div className="space-y-2">
                  {selectedPlan.tasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                    >
                      <CheckCircleIcon
                        className={`h-5 w-5 ${
                          task.status === 'completed'
                            ? 'text-green-600'
                            : 'text-neutral-300 dark:text-neutral-600'
                        }`}
                      />
                      <span
                        className={`flex-1 ${
                          task.status === 'completed'
                            ? 'line-through text-neutral-500'
                            : 'text-neutral-900 dark:text-neutral-100'
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.assignedTo && (
                        <div className="text-xs text-neutral-500">
                          Assigned to {selectedPlan.members.find(m => m.id === task.assignedTo)?.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button className="btn btn-secondary w-full mt-4">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Task
                </button>
              </div>

              {/* Chat */}
              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Discussion
                </h3>

                {/* Messages */}
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {selectedPlan.messages.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    selectedPlan.messages.map(message => (
                      <div key={message.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                          {message.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                              {message.userName}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {message.timestamp.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-2">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage(selectedPlan.id)
                      }
                    }}
                    placeholder="Type a message..."
                    className="input flex-1"
                  />
                  <button
                    onClick={() => handleSendMessage(selectedPlan.id)}
                    className="btn btn-primary"
                    disabled={!messageInput.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center card min-h-96">
              <div className="text-center text-neutral-500 dark:text-neutral-400">
                Select a plan to view details and chat
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Messenger */}
      <GlobalMessenger />
    </DashboardLayout>
  )
}
