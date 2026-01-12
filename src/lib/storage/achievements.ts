interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
  category: 'productivity' | 'consistency' | 'milestones' | 'social'
}

const ACHIEVEMENTS_STORAGE_KEY = 'daily-companion-achievements'

export function getAchievements(): Achievement[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY)
    if (!stored) return []

    const achievements = JSON.parse(stored)

    // Convert date strings back to Date objects
    return achievements.map((achievement: any) => ({
      ...achievement,
      unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
    }))
  } catch (error) {
    console.error('Error loading achievements from localStorage:', error)
    return []
  }
}

export function saveAchievements(achievements: Achievement[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements))
  } catch (error) {
    console.error('Error saving achievements to localStorage:', error)
  }
}

export function clearAllAchievements(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY)
}
