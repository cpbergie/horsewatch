'use server'

import { createAdminClient } from '@/lib/supabase/admin'

interface PhotoData {
  base64: string
  mimeType: string
  extension: string
}

export async function addCaretakerRole(data: {
  userId: string
  location: string
  yearsExperience: number
  services: string[]
  disciplines: string[]
  hasOwnTransport: boolean
  ratesPerDay?: string
  availabilityNotes?: string
  bio: string
  referencesAvailable: boolean
  photo?: PhotoData
}) {
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

  const updateData: Record<string, unknown> = {
    is_caretaker: true,
    is_approved: false,
    location: data.location,
    bio: data.bio,
  }
  if (profilePhotoUrl) updateData.profile_photo_url = profilePhotoUrl

  const { error: profileError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', data.userId)

  if (profileError) return { error: profileError.message }

  const { error: caretakerError } = await supabase
    .from('caretaker_profiles')
    .insert({
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
}
