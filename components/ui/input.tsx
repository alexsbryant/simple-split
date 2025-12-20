import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({
  label,
  error,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] pl-4"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`
          w-full px-5 py-3
          glass-input
          transition-all duration-150
          ${error ? 'border-[var(--negative)]' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-[var(--negative)] pl-4">{error}</span>
      )}
    </div>
  )
}
