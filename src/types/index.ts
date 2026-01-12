// Core data models

export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  settings: UserSettings
  privacyFlags: PrivacyFlags
  createdAt: Date
  updatedAt: Date
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'ru'
  notifications: {
    enabled: boolean
    sound: boolean
    vibrate: boolean
  }
  pomodoro: {
    workDuration: number // minutes
    shortBreak: number
    longBreak: number
    longBreakInterval: number
  }
  privacy: {
    localOnly: boolean
    encryptData: boolean
    shareAchievements: boolean
  }
}

export interface PrivacyFlags {
  allowAnalytics: boolean
  allowCloudSync: boolean
  allowLocationTracking: boolean
  allowActivityTracking: boolean
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'delegated'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  ownerId: string
  title: string
  description?: string
  startTime?: Date
  endTime?: Date
  duration?: number // minutes
  priority: TaskPriority
  status: TaskStatus
  repeatRule?: RepeatRule
  location?: Location
  stepTrigger?: StepTrigger
  templateId?: string
  assignees?: string[]
  tags: string[]
  notes?: string
  pomodoroSessions?: PomodoroSession[]
  createdAt?: Date
  updatedAt?: Date
  completedAt?: Date
}

export interface RepeatRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number // repeat every N days/weeks/months
  daysOfWeek?: number[] // 0-6 for weekly
  endDate?: Date
  count?: number // number of occurrences
}

export interface Location {
  lat: number
  lng: number
  address: string
  radius?: number // meters for geofencing
  enabled: boolean
}

export interface StepTrigger {
  threshold: number // step count
  enabled: boolean
  source: 'google-fit' | 'apple-health' | 'manual' | 'approximation'
}

export interface Template {
  id: string
  ownerId: string
  title: string
  description?: string
  fields: Partial<Task>
  useCount: number
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Plan {
  id: string
  title: string
  description?: string
  ownerId: string
  members: PlanMember[]
  tasks: string[] // task IDs
  createdAt: Date
  updatedAt: Date
}

export interface PlanMember {
  userId: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: Date
}

export interface PomodoroSession {
  id: string
  taskId?: string
  startTime: Date
  endTime?: Date
  duration: number // actual duration in minutes
  type: 'work' | 'short-break' | 'long-break'
  completed: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  criteria: {
    type: 'tasks_completed' | 'pomodoro_sessions' | 'streak_days' | 'steps_total'
    threshold: number
  }
  icon: string
  unlockedAt?: Date
  isPublic: boolean
}

export interface Notification {
  id: string
  userId: string
  taskId?: string
  type: 'reminder' | 'delegation' | 'plan_update' | 'achievement'
  title: string
  body: string
  payload?: Record<string, any>
  read: boolean
  deliveredAt: Date
  actionUrl?: string
}

export interface AnalyticsEvent {
  id: string
  userId: string
  eventType: 'task_created' | 'task_completed' | 'pomodoro_completed' | 'login' | 'export'
  meta?: Record<string, any>
  timestamp: Date
}

export interface AnalyticsData {
  period: 'week' | 'month' | 'year'
  tasksCompleted: number
  pomodoroSessions: number
  completionRate: number
  totalSteps?: number
  averageSessionsPerDay: number
  productivityScore: number
  chartData: {
    date: string
    tasksCompleted: number
    pomodoroSessions: number
    steps?: number
  }[]
}

// API Request/Response types

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  displayName: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  startTime?: string
  endTime?: string
  duration?: number
  priority?: TaskPriority
  location?: Location
  stepTrigger?: StepTrigger
  repeatRule?: RepeatRule
  templateId?: string
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: TaskStatus
}

export interface DelegateTaskRequest {
  taskId: string
  userId: string
  message?: string
}

export interface CreatePlanRequest {
  title: string
  description?: string
  members?: string[] // user IDs
}

export interface WebPushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// Component Props types

export interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onDrag?: boolean
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
}

export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export interface InputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time'
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}
