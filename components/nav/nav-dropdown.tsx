'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'

interface NavDropdownProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
  className?: string
}

export function NavDropdown({ trigger, children, align = 'right', className = '' }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on click outside and escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger button with aria attributes */}
      <div onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
        {trigger}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={`
            absolute top-full mt-2 w-72
            bg-[var(--bg-card)]
            border border-[var(--border-default)]
            rounded-lg
            py-2
            z-50
            shadow-lg
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {children}
        </div>
      )}
    </div>
  )
}
