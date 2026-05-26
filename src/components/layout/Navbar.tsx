import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import NavbarClient from './NavbarClient'

/**
 * Server component — reads auth state from cookies on every request.
 * Uses admin client for profile fetch to bypass recursive RLS policies
 * on the profiles table. Safe here because this runs server-side only.
 */
export default async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let navProfile: { full_name: string; profile_photo_url: string | null; is_admin: boolean } | null = null

  if (user) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('profiles')
      .select('full_name, profile_photo_url, is_admin')
      .eq('id', user.id)
      .single()
    navProfile = data
  }

  return <NavbarClient initialUser={user} initialProfile={navProfile} />
}
