import { z } from 'zod'

export const caretakerSignupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  location: z.string().min(2, 'City or zip code is required'),
  yearsExperience: z.number().min(0, 'Please enter your years of experience'),
  services: z.array(z.string()).min(1, 'Please select at least one service'),
  disciplines: z.array(z.string()).min(1, 'Please select at least one discipline'),
  hasOwnTransport: z.boolean(),
  ratesPerDay: z.string().optional(),
  availabilityNotes: z.string().optional(),
  bio: z.string().min(10, 'Please tell owners a bit about yourself'),
  referencesAvailable: z.boolean(),
})

export type CaretakerSignupValues = z.infer<typeof caretakerSignupSchema>
