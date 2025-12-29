import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { InviteLandingPage } from '@/components/invitations/invite-landing-page'

type Props = {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()

  // Get invite link info (SECURITY DEFINER function - works for anyone)
  const { data: linkInfo } = await supabase.rpc('get_invite_link_info', {
    invite_token: token,
  })

  const info = linkInfo?.[0]

  // Invalid or not found
  if (!info?.valid) {
    return <InviteLandingPage status="invalid" token={token} />
  }

  // Expired
  if (info.is_expired) {
    return <InviteLandingPage status="expired" token={token} groupName={info.group_name} />
  }

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Authenticated: attempt to join immediately via RPC
    const { data: joinResult, error: rpcError } = await supabase.rpc('join_group_via_link', {
      invite_token: token,
    })

    if (rpcError) {
      return (
        <InviteLandingPage
          status="error"
          token={token}
          error={rpcError.message}
        />
      )
    }

    const result = joinResult?.[0]
    if (result?.success) {
      redirect(`/groups/${result.group_id}`)
    } else {
      return (
        <InviteLandingPage
          status="error"
          token={token}
          error={result?.error_message || 'Failed to join group'}
        />
      )
    }
  }

  // Not authenticated: show login/signup choice
  return (
    <InviteLandingPage
      status="unauthenticated"
      token={token}
      groupName={info.group_name}
      inviterName={info.inviter_name}
      expiresAt={info.expires_at}
    />
  )
}
