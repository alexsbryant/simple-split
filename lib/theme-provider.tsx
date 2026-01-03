'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { ThemePreference, ResolvedTheme, DEFAULT_THEME } from './theme-types'
import {
  getStoredTheme,
  setStoredTheme,
  resolveTheme,
  applyTheme,
  getSystemTheme,
} from './theme-utils'

type ThemeContextType = {
  theme: ThemePreference
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(DEFAULT_THEME)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark')
  const [mounted, setMounted] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const stored = getStoredTheme() || DEFAULT_THEME
    setThemeState(stored)
    const resolved = resolveTheme(stored)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [])

  // Listen for system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const newResolved = getSystemTheme()
      setResolvedTheme(newResolved)
      applyTheme(newResolved)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  // Listen for cross-tab storage changes
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        const newTheme = e.newValue as ThemePreference
        setThemeState(newTheme)
        const resolved = resolveTheme(newTheme)
        setResolvedTheme(resolved)
        applyTheme(resolved)
      }
    }

    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const setTheme = useCallback((newTheme: ThemePreference) => {
    console.log('setTheme called with:', newTheme)
    setThemeState(newTheme)
    setStoredTheme(newTheme)

    const resolved = resolveTheme(newTheme)
    console.log('Resolved theme:', resolved)
    setResolvedTheme(resolved)
    applyTheme(resolved)
    console.log('Applied theme, dark class present?', document.documentElement.classList.contains('dark'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
