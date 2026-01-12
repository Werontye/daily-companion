'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { en, Translations } from '@/locales/en'
import { ru } from '@/locales/ru'

type Locale = 'en' | 'ru'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const translations: Record<Locale, Translations> = {
  en,
  ru,
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [t, setT] = useState<Translations>(en)

  useEffect(() => {
    // Always use English - language selection removed
    setLocaleState('en')
    setT(en)
    localStorage.setItem('locale', 'en')
  }, [])

  const setLocale = (newLocale: Locale) => {
    // Language selection removed - always use English
    setLocaleState('en')
    setT(en)
    localStorage.setItem('locale', 'en')
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
