import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { data: pending } = await admin
    .from('profiles')
    .select('id, full_name, email, location, profile_photo_url, created_at, caretaker_profiles(years_experience, services, bio)')
    .eq('is_caretaker', true)
    .eq('caretaker_status', 'pending')
    .order('created_at', { ascending: true })

  const { data: allUsers } = await admin
    .from('profiles')
    .select('id, full_name, email, location, is_owner, is_caretaker, is_admin, is_approved, caretaker_status, created_at')
    .order('created_at', { ascending: false })

  const totalOwners = (allUsers ?? []).filter(u => u.is_owner).length
  const totalCaretakers = (allUsers ?? []).filter(u => u.is_caretaker).length
  const approvedCaretakers = (allUsers ?? []).filter(u => u.is_caretaker && u.is_approved).length
  const pendingCount = (pending ?? []).length

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />
      <AdminClient
        pending={pending ?? []}
        allUsers={allUsers ?? []}
        stats={{ totalOwners, totalCaretakers, approvedCaretakers, pendingCount }}
      />
    </div>
  )
}
