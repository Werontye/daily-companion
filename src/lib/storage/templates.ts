interface TemplateItem {
  id: string
  name: string
  description: string
  category: string
  icon: string
  color: string
  tasks: Array<{
    title: string
    duration?: number
    priority: 'low' | 'medium' | 'high' | 'urgent'
  }>
  usageCount: number
  isPublic: boolean
  ownerId: string
}

const TEMPLATES_STORAGE_KEY = 'daily-companion-templates'

export function getTemplates(): TemplateItem[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY)
    if (!stored) return []

    return JSON.parse(stored)
  } catch (error) {
    console.error('Error loading templates from localStorage:', error)
    return []
  }
}

export function saveTemplates(templates: TemplateItem[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates))
  } catch (error) {
    console.error('Error saving templates to localStorage:', error)
  }
}

export function getTemplateById(id: string): TemplateItem | null {
  const templates = getTemplates()
  return templates.find(template => template.id === id) || null
}

export function addTemplate(template: TemplateItem): void {
  const templates = getTemplates()
  saveTemplates([...templates, template])
}

export function updateTemplate(id: string, updates: Partial<TemplateItem>): void {
  const templates = getTemplates()
  const updatedTemplates = templates.map(template =>
    template.id === id ? { ...template, ...updates } : template
  )
  saveTemplates(updatedTemplates)
}

export function deleteTemplate(id: string): void {
  const templates = getTemplates()
  saveTemplates(templates.filter(template => template.id !== id))
}

export function clearAllTemplates(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TEMPLATES_STORAGE_KEY)
}
