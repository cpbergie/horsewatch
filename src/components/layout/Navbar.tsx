import { createClient } from '@/lib/supabase/server'
import NavbarClient from './NavbarClient'

/**
 * Server component — reads auth state from cookies on every request.
 * Passes user + profile as props to the interactive client component.
 * This eliminates all client-side auth timing issues.
 */
export default async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let navProfile: { full_name: string; profile_photo_url: string | null; is_admin: boolean } | null = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, profile_photo_url, is_admin')
      .eq('id', user.id)
      .single()
    navProfile = data
  }

  return <NavbarClient initialUser={user} initialProfile={navProfile} />
}
