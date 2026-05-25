import { z } from 'zod'

export const ownerSignupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  location: z.string().min(2, 'City or zip code is required'),
  numHorses: z.number().min(1, 'Please enter at least 1 horse'),
  horseDetails: z.string().optional(),
  propertyAddress: z.string().min(2, 'General property area is required'),
  barnAccessNotes: z.string().optional(),
})

export type OwnerSignupValues = z.infer<typeof ownerSignupSchema>
