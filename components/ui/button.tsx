import { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    px-6 py-3
    text-sm font-semibold uppercase tracking-wider
    rounded-full
    transition-all duration-150
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variantStyles: Record<ButtonVariant, string> = {
    primary: `
      bg-[var(--accent)] text-black
      hover:bg-[var(--accent-hover)] hover:shadow-lg
      active:scale-[0.98]
    `,
    secondary: `
      bg-transparent text-[var(--text-primary)]
      border border-[var(--glass-border)]
      hover:bg-[var(--glass-bg)] hover:border-[rgba(255,255,255,0.2)]
      active:scale-[0.98]
    `,
    danger: `
      bg-[var(--negative)] text-white
      hover:brightness-110 hover:shadow-lg
      active:scale-[0.98]
    `,
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
