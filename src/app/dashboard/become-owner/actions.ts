'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function addOwnerRole(data: {
  userId: string
  location: string
  numHorses: number
  horseDetails?: string
  propertyAddress: string
  barnAccessNotes?: string
}) {
  const supabase = createAdminClient()

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_owner: true, location: data.location })
    .eq('id', data.userId)

  if (profileError) return { error: profileError.message }

  const { error: ownerError } = await supabase
    .from('owner_profiles')
    .insert({
      id: data.userId,
      num_horses: data.numHorses,
      horse_details: data.horseDetails || null,
      property_address: data.propertyAddress,
      barn_access_notes: data.barnAccessNotes || null,
    })

  if (ownerError) return { error: ownerError.message }

  return { success: true }
}
