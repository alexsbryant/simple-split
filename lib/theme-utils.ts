import { ThemePreference, ResolvedTheme, THEME_STORAGE_KEY } from './theme-types'

export function getStoredTheme(): ThemePreference | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null
  } catch {
    return null
  }
}

export function setStoredTheme(theme: ThemePreference): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Silent fail in private mode
  }
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') {
    return getSystemTheme()
  }
  return preference
}

export function applyTheme(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
