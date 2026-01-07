interface ActivityCountPillProps {
  count: number
  variant: 'reaction' | 'notification'
  emoji?: string
  highlighted?: boolean
}

export function ActivityCountPill({
  count,
  variant,
  emoji,
  highlighted = false,
}: ActivityCountPillProps) {
  // Don't render anything if count is 0
  if (count === 0) return null

  // Format count for display (99+ for counts over 99)
  const displayCount = count > 99 ? '99+' : count.toString()

  // Build className based on variant and highlighted state
  const baseClasses =
    'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all duration-150'

  const variantClasses = highlighted
    ? 'bg-[var(--accent)]/20 border border-[var(--accent)]'
    : 'bg-[var(--bg-card)] border border-[var(--glass-border)]'

  // Accessibility label
  const getAriaLabel = () => {
    if (variant === 'reaction') {
      return `${emoji} reaction, ${count} ${count === 1 ? 'person' : 'people'}`
    }
    return `${count} unread ${count === 1 ? 'notification' : 'notifications'}`
  }

  return (
    <div className={`${baseClasses} ${variantClasses}`} aria-label={getAriaLabel()}>
      {variant === 'reaction' && emoji && <span>{emoji}</span>}
      {variant === 'notification' && (
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
          <circle cx="4" cy="4" r="4" fill="rgb(239, 68, 68)" />
        </svg>
      )}
      <span className="text-[var(--text-secondary)]">{displayCount}</span>
    </div>
  )
}
