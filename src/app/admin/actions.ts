'use server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function approveCaretaker(userId: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true, caretaker_status: 'approved' })
      .eq('id', userId)
    if (error) return { error: error.message }
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

export async function rejectCaretaker(userId: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: false, caretaker_status: 'rejected' })
      .eq('id', userId)
    if (error) return { error: error.message }
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}
