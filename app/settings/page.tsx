import { redirect } from 'next/navigation'
import { Nav } from '@/components/nav'
import { SettingsForm } from '@/components/settings/settings-form'
import { createClient } from '@/lib/supabase-server'

export default async function SettingsPage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    redirect('/')
  }

  // Fetch user profile
  const { data: userData } = await supabase
    .from('users')
    .select('id, email, display_name')
    .eq('id', authUser.id)
    .single()

  if (!userData) {
    redirect('/')
  }

  const currentUser = {
    id: userData.id,
    email: userData.email,
    displayName: userData.display_name,
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-[640px] mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-title)' }}>
            Settings
          </h1>
        </header>

        <SettingsForm currentUser={currentUser} />
      </main>
    </div>
  )
}
