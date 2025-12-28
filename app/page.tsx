import { AuthForm } from '@/components/auth/auth-form'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center max-w-md">
        <img
          src="/logos/settle-logo.png"
          alt="Settle - expense splitting simplified"
          className="mb-10 h-32 md:h-40 w-auto rounded-[16px]"
        />
        <p className="text-lg text-[var(--text-secondary)] mb-10 text-center">
          Expense splitting, simplified.
        </p>
        <AuthForm />
      </div>
    </div>
  )
}
