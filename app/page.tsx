import { AuthForm } from '@/components/auth/auth-form'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center max-w-md">
        <h1 className="text-6xl md:text-7xl font-semibold text-white font-[family-name:var(--font-bodoni)] mb-4 text-center">
          Simple Split
        </h1>
        <p className="text-lg text-[var(--text-secondary)] mb-10 text-center">
          Split expenses with friends, simply.
        </p>
        <AuthForm />
      </div>
    </div>
  )
}
