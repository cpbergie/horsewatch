'use server'

import { createAdminClient } from '@/lib/supabase/admin'

interface PhotoData {
  base64: string
  mimeType: string
  extension: string
}

export async function setupOwnerProfile(data: {
  userId: string
  fullName: string
  email: string
  phone?: string
  location: string
  numHorses: number
  horseDetails?: string
  propertyAddress: string
  barnAccessNotes?: string
}) {
  try {
    const supabase = createAdminClient()

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.userId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      location: data.location,
      is_owner: true,
      is_approved: false,
    })
    if (profileError) return { error: profileError.message }

    const { error: ownerError } = await supabase.from('owner_profiles').insert({
      id: data.userId,
      num_horses: data.numHorses,
      horse_details: data.horseDetails || null,
      property_address: data.propertyAddress,
      barn_access_notes: data.barnAccessNotes || null,
    })
    if (ownerError) return { error: ownerError.message }

    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

export async function setupCaretakerProfile(data: {
  userId: string
  fullName: string
  email: string
  phone?: string
  location: string
  bio: string
  yearsExperience: number
  services: string[]
  disciplines: string[]
  hasOwnTransport: boolean
  ratesPerDay?: string
  availabilityNotes?: string
  referencesAvailable: boolean
  photo?: PhotoData
}) {
  try {
    const supabase = createAdminClient()

    let profilePhotoUrl: string | null = null
    if (data.photo) {
      const buffer = Buffer.from(data.photo.base64, 'base64')
      const filePath = `${data.userId}/avatar.${data.photo.extension}`
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, buffer, { contentType: data.photo.mimeType, upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(filePath)
        profilePhotoUrl = urlData.publicUrl
      }
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.userId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      location: data.location,
      bio: data.bio,
      profile_photo_url: profilePhotoUrl,
      is_caretaker: true,
      is_approved: false,
    })
    if (profileError) return { error: profileError.message }

    const { error: caretakerError } = await supabase.from('caretaker_profiles').insert({
      id: data.userId,
      years_experience: data.yearsExperience,
      services: data.services,
      disciplines: data.disciplines,
      has_own_transport: data.hasOwnTransport,
      rates_per_day: data.ratesPerDay || null,
      availability_notes: data.availabilityNotes || null,
      references_available: data.referencesAvailable,
    })
    if (caretakerError) return { error: caretakerError.message }

    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}
