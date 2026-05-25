import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Use admin client for profile reads — getUser() already verified auth,
  // and the anon client's RLS can fail on first load if the session cookie
  // hasn't been forwarded to PostgREST yet.
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('id, full_name, location, is_owner, is_caretaker, is_approved, owner_profiles(*), caretaker_profiles(*)')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/setup')

  const { data: recentCaretakers } = await admin
    .from('profiles')
    .select('id, full_name, location, profile_photo_url, caretaker_profiles(services)')
    .eq('is_caretaker', true)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />
      <DashboardClient
        profile={profile}
        recentCaretakers={recentCaretakers ?? []}
      />
    </div>
  )
}
