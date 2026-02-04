'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { XIcon } from '@/components/icons'

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
  read: boolean
}

interface Conversation {
  conversationId: string
  otherUser: {
    id: string
    displayName: string
    avatar: string
    avatarType: string
  } | null
  lastMessage: {
    content: string
    sender: string
    createdAt: string
    read: boolean
  }
  unreadCount: number
}

export function GlobalMessenger() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showChatList, setShowChatList] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get current user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth')
        if (response.ok) {
          const data = await response.json()
          setCurrentUserId(data.user?.id || null)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/messages')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  }, [])

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }, [])

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await fetch(`/api/messages/${conversationId}`, {
        method: 'PATCH',
      })
      // Update unread count locally
      setConversations(prev => prev.map(c =>
        c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c
      ))
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  }, [])

  // Load conversations when messenger opens
  useEffect(() => {
    if (isExpanded) {
      fetchConversations()
    }
  }, [isExpanded, fetchConversations])

  // Poll for new messages every 5 seconds when expanded
  useEffect(() => {
    if (isExpanded) {
      pollIntervalRef.current = setInterval(() => {
        fetchConversations()
        if (selectedConversation) {
          fetchMessages(selectedConversation.conversationId)
        }
      }, 5000)

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
        }
      }
    }
  }, [isExpanded, selectedConversation, fetchConversations, fetchMessages])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation?.otherUser || isSending) return

    setIsSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedConversation.otherUser.id,
          content: messageText.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, {
          id: data.message.id,
          sender: data.message.sender,
          content: data.message.content,
          createdAt: data.message.createdAt,
          read: false,
        }])
        setMessageText('')
        fetchConversations() // Refresh conversations list
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setShowChatList(false)
    setIsLoading(true)
    await fetchMessages(conversation.conversationId)
    await markAsRead(conversation.conversationId)
    setIsLoading(false)
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return formatTime(dateString)
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-GB', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
    }
  }

  const renderAvatar = (user: { displayName: string; avatar: string; avatarType: string } | null, size: 'sm' | 'md' = 'md') => {
    if (!user) return null
    const sizeClasses = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'

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

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-24 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-50"
        aria-label="Open messenger"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        {totalUnread > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
            {totalUnread > 99 ? '99+' : totalUnread}
          </div>
        )}
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-24 w-96 h-[600px] bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl z-50 flex flex-col animate-scale-in border border-neutral-200 dark:border-neutral-700">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between bg-blue-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          {!showChatList && selectedConversation && (
            <button
              onClick={() => {
                setShowChatList(true)
                setSelectedConversation(null)
                setMessages([])
              }}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h3 className="font-bold text-lg">
            {showChatList ? 'Messages' : selectedConversation?.otherUser?.displayName || 'Chat'}
          </h3>
        </div>
        <button
          onClick={() => {
            setIsExpanded(false)
            setShowChatList(true)
            setSelectedConversation(null)
            setMessages([])
          }}
          className="p-1 hover:bg-blue-700 rounded transition-colors"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Chat List */}
      {showChatList && (
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 dark:text-neutral-400 p-4">
              <svg className="h-16 w-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-center text-sm">
                No messages yet.<br />
                Add friends to start chatting!
              </p>
            </div>
          ) : (
            conversations.map(conversation => (
              <button
                key={conversation.conversationId}
                onClick={() => selectConversation(conversation)}
                className="w-full p-4 border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3 text-left"
              >
                {renderAvatar(conversation.otherUser)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {conversation.otherUser?.displayName || 'Unknown User'}
                    </h4>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2 flex-shrink-0">
                      {formatLastMessageTime(conversation.lastMessage.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate flex-1">
                      {conversation.lastMessage.sender === currentUserId ? 'You: ' : ''}
                      {conversation.lastMessage.content}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold ml-2 flex-shrink-0">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Chat View */}
      {!showChatList && selectedConversation && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="loading-spinner"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
                <p className="text-sm">No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map(message => {
                const isOwn = message.sender.id === currentUserId
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                      {!isOwn && renderAvatar(message.sender, 'sm')}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-neutral-500 dark:text-neutral-400'}`}>
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={isSending}
                className="flex-1 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isSending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
