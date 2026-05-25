'use server'

import { createAdminClient } from '@/lib/supabase/admin'

interface CreateOwnerProfileData {
  userId: string
  fullName: string
  email: string
  phone?: string
  location: string
  numHorses: number
  horseDetails?: string
  propertyAddress: string
  barnAccessNotes?: string
}

export async function createOwnerProfile(data: CreateOwnerProfileData) {
  const supabase = createAdminClient()

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.userId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      location: data.location,
      is_owner: true,
    })

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
