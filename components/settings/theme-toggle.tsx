'use client'

import { useTheme } from '@/lib/theme-provider'

const themes = [
  { value: 'light' as const, label: 'Light', icon: '☀️' },
  { value: 'dark' as const, label: 'Dark', icon: '🌙' },
  { value: 'system' as const, label: 'System', icon: '💻' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <label className="block text-sm text-[var(--text-secondary)] mb-2">
        Theme
      </label>
      <div className="flex gap-2">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`
              flex-1 px-4 py-3 rounded-xl
              border transition-all duration-150
              ${
                theme === t.value
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)]'
                  : 'border-[var(--border-default)] bg-[var(--bg-card-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-card-hover)]'
              }
            `}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">{t.icon}</span>
              <span className="text-sm font-medium">{t.label}</span>
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-2">
        {theme === 'system'
          ? 'Automatically matches your device settings'
          : `Always use ${theme} mode`}
      </p>
    </div>
  )
}
