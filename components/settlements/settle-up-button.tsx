'use client'

interface SettleUpButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function SettleUpButton({ onClick, disabled }: SettleUpButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        inline-flex items-center gap-2
        px-4 py-2
        text-sm font-semibold
        rounded-full
        bg-[var(--positive)] text-black
        hover:brightness-110 hover:shadow-lg
        active:scale-[0.98]
        transition-all duration-150
        cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Settle Up
    </button>
  )
}
