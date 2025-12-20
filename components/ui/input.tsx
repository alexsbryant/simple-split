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
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="text-sm font-medium uppercase tracking-wider text-[#666666]"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`
          w-full px-3 py-2
          bg-white
          border border-[#E5E5E5]
          text-[#1A1A1A]
          placeholder:text-[#999999]
          transition-all duration-150
          focus:outline-none focus:border-[#C4960C] focus:shadow-sm
          hover:border-[#CCCCCC]
          ${error ? 'border-[#C41E1E]' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-[#C41E1E]">{error}</span>
      )}
    </div>
  )
}
