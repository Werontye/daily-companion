'use client'

import { useState, useEffect } from 'react'
import { XIcon } from '@/components/icons'
import { isDemoMode } from '@/lib/demoMode'

interface Message {
  id: string
  sender: string
  text: string
  timestamp: Date
  isOwn: boolean
}

interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage: string
  unreadCount: number
}

const demoMessages: Message[] = [
  {
    id: '1',
    sender: 'John Doe',
    text: 'Hey! How is the project going?',
    timestamp: new Date(Date.now() - 3600000),
    isOwn: false
  },
  {
    id: '2',
    sender: 'You',
    text: 'Great! Almost finished with the templates feature.',
    timestamp: new Date(Date.now() - 1800000),
    isOwn: true
  },
  {
    id: '3',
    sender: 'John Doe',
    text: 'Awesome! Let me know when you need me to test it.',
    timestamp: new Date(Date.now() - 900000),
    isOwn: false
  }
]

const demoChats: Chat[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: '👤',
    lastMessage: 'Awesome! Let me know when...',
    unreadCount: 0
  },
  {
    id: '2',
    name: 'Team Project',
    avatar: '👥',
    lastMessage: 'Sarah: Thanks for the update!',
    unreadCount: 2
  },
  {
    id: '3',
    name: 'Anna Smith',
    avatar: '👩',
    lastMessage: 'See you tomorrow!',
    unreadCount: 0
  }
]

export function GlobalMessenger() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showChatList, setShowChatList] = useState(true)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    // Only load demo data in demo mode
    if (isDemoMode()) {
      setMessages(demoMessages)
      setChats(demoChats)
    } else {
      // For real accounts, start with empty chats
      setMessages([])
      setChats([])
    }
  }, [])

  const handleSendMessage = () => {
    if (!messageText.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      text: messageText,
      timestamp: new Date(),
      isOwn: true
    }

    setMessages([...messages, newMessage])
    setMessageText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const selectChat = (chat: Chat) => {
    setSelectedChat(chat)
    setShowChatList(false)
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
        {chats.reduce((sum, chat) => sum + chat.unreadCount, 0) > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
            {chats.reduce((sum, chat) => sum + chat.unreadCount, 0)}
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
          {!showChatList && selectedChat && (
            <button
              onClick={() => setShowChatList(true)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h3 className="font-bold text-lg">
            {showChatList ? 'Messages' : selectedChat?.name}
          </h3>
        </div>
        <button
          onClick={() => {
            setIsExpanded(false)
            setShowChatList(true)
          }}
          className="p-1 hover:bg-blue-700 rounded transition-colors"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Chat List */}
      {showChatList && (
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => selectChat(chat)}
              className="w-full p-4 border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3 text-left"
            >
              <div className="text-3xl">{chat.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {chat.name}
                  </h4>
                  {chat.unreadCount > 0 && (
                    <div className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                  {chat.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Chat View */}
      {!showChatList && selectedChat && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {!message.isOwn && (
                    <div className="text-xs font-semibold mb-1 opacity-75">
                      {message.sender}
                    </div>
                  )}
                  <p className="text-sm">{message.text}</p>
                  <div className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
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
                className="flex-1 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
