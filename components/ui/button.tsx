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
    px-5 py-2.5
    text-sm font-semibold uppercase tracking-wider
    rounded-full
    cursor-pointer
    transition-all duration-150
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variantStyles: Record<ButtonVariant, string> = {
    primary: `
      bg-[var(--accent)] text-white opacity-95
      hover:opacity-100 hover:bg-[var(--accent-hover)]
      active:scale-[0.98]
    `,
    secondary: `
      bg-transparent text-[var(--text-primary)]
      border border-[var(--border-default)]
      hover:bg-[var(--nav-button-hover)]
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
