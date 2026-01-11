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
    // Load language from localStorage
    const stored = localStorage.getItem('locale') as Locale
    if (stored && (stored === 'en' || stored === 'ru')) {
      setLocaleState(stored)
      setT(translations[stored])
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0]
      if (browserLang === 'ru') {
        setLocaleState('ru')
        setT(ru)
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    setT(translations[newLocale])
    localStorage.setItem('locale', newLocale)
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
