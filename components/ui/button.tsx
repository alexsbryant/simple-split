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
    px-4 py-2
    text-sm font-semibold uppercase tracking-wider
    transition-all duration-150
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variantStyles: Record<ButtonVariant, string> = {
    primary: `
      bg-[#C4960C] text-[#1A1A1A]
      hover:bg-[#A67D0A] hover:-translate-y-0.5 hover:shadow-md
      active:translate-y-0
    `,
    secondary: `
      bg-transparent text-[#1A1A1A]
      border-2 border-[#1A1A1A]
      hover:bg-[#1A1A1A] hover:text-white hover:-translate-y-0.5
      active:translate-y-0
    `,
    danger: `
      bg-[#C41E1E] text-white
      hover:bg-[#A01818] hover:-translate-y-0.5 hover:shadow-md
      active:translate-y-0
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
