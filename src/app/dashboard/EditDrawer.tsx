'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateOwnerProfile, updateCaretakerProfile } from './actions'

// ── Shared primitives ─────────────────────────────────────

function DrawerShell({ open, onClose, title, children, onSave, saving }: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  onSave: () => void
  saving: boolean
}) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed right-0 inset-y-0 w-full max-w-[440px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f0ee] flex-shrink-0">
          <h2 className="font-display text-xl font-bold text-[#1A1A1A]">{title}</h2>
          <button onClick={onClose} className="p-1.5 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors rounded-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {children}
        </div>

        <div className="px-6 py-4 border-t border-[#f0f0ee] flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full font-sans text-sm font-semibold text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-[#2D5016] text-white font-sans text-sm font-semibold hover:bg-[#1e3710] transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-sans text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/40 mb-1.5">{label}</p>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 font-sans text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#2D5016] focus:ring-1 focus:ring-[#2D5016]/20 transition-colors'

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputCls} resize-none`}
    />
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center justify-between w-full py-1">
      <span className="font-sans text-sm text-[#1A1A1A]">{label}</span>
      <div className={`relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? 'bg-[#2D5016]' : 'bg-[#e5e7eb]'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
    </button>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="w-0.5 h-4 bg-[#C9922A] flex-shrink-0" />
      <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/40">{label}</span>
    </div>
  )
}

function CheckboxList({ options, selected, onChange }: {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value])
  }
  return (
    <div className="space-y-2 mt-1">
      {options.map(opt => (
        <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={selected.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            className="w-4 h-4 rounded border-[#e5e7eb] accent-[#2D5016] cursor-pointer"
          />
          <span className="font-sans text-sm text-[#1A1A1A] group-hover:text-[#2D5016] transition-colors">{opt.label}</span>
        </label>
      ))}
    </div>
  )
}

// ── Owner edit drawer ─────────────────────────────────────

export interface OwnerEditProps {
  id: string
  full_name: string
  phone: string | null
  location: string
  num_horses: number
  horse_details: string | null
  property_address: string
  barn_access_notes: string | null
}

export function OwnerEditDrawer({ open, onClose, data }: {
  open: boolean
  onClose: () => void
  data: OwnerEditProps
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState(data.full_name)
  const [phone, setPhone] = useState(data.phone ?? '')
  const [location, setLocation] = useState(data.location)
  const [numHorses, setNumHorses] = useState(String(data.num_horses))
  const [horseDetails, setHorseDetails] = useState(data.horse_details ?? '')
  const [propertyAddress, setPropertyAddress] = useState(data.property_address)
  const [barnAccessNotes, setBarnAccessNotes] = useState(data.barn_access_notes ?? '')

  useEffect(() => {
    if (open) {
      setFullName(data.full_name)
      setPhone(data.phone ?? '')
      setLocation(data.location)
      setNumHorses(String(data.num_horses))
      setHorseDetails(data.horse_details ?? '')
      setPropertyAddress(data.property_address)
      setBarnAccessNotes(data.barn_access_notes ?? '')
      setError('')
    }
  }, [open, data])

  async function handleSave() {
    setSaving(true)
    setError('')
    const result = await updateOwnerProfile(data.id, {
      fullName,
      phone,
      location,
      numHorses: parseInt(numHorses) || 1,
      horseDetails,
      propertyAddress,
      barnAccessNotes,
    })
    setSaving(false)
    if ('error' in result) {
      setError(result.error ?? 'Something went wrong')
    } else {
      router.refresh()
      onClose()
    }
  }

  return (
    <DrawerShell open={open} onClose={onClose} title="Edit Owner Profile" onSave={handleSave} saving={saving}>
      <SectionDivider label="Your Details" />
      <Field label="Full Name"><Input value={fullName} onChange={setFullName} /></Field>
      <Field label="Phone"><Input value={phone} onChange={setPhone} type="tel" placeholder="Optional" /></Field>
      <Field label="Location"><Input value={location} onChange={setLocation} placeholder="City, State" /></Field>

      <SectionDivider label="Your Horses" />
      <Field label="Number of Horses"><Input value={numHorses} onChange={setNumHorses} type="number" /></Field>
      <Field label="Horse Details">
        <Textarea value={horseDetails} onChange={setHorseDetails} placeholder="Breed, age, temperament, feeding instructions…" rows={4} />
      </Field>
      <Field label="Property Address"><Input value={propertyAddress} onChange={setPropertyAddress} /></Field>
      <Field label="Barn Access Notes">
        <Textarea value={barnAccessNotes} onChange={setBarnAccessNotes} placeholder="Gate codes, parking, where to find supplies…" rows={3} />
      </Field>

      {error && <p className="font-sans text-sm text-red-600">{error}</p>}
    </DrawerShell>
  )
}

// ── Caretaker edit drawer ─────────────────────────────────

const SERVICES = [
  { value: 'feeding_turnout', label: 'Feeding & Turnout' },
  { value: 'riding_exercise', label: 'Riding & Exercise' },
  { value: 'overnight', label: 'Overnight Care' },
]

const DISCIPLINES = [
  { value: 'hunter_jumper', label: 'Hunter/Jumper' },
  { value: 'western', label: 'Western' },
  { value: 'dressage', label: 'Dressage' },
  { value: 'trail', label: 'Trail Riding' },
  { value: 'general', label: 'General Care' },
]

export interface CaretakerEditProps {
  id: string
  full_name: string
  phone: string | null
  location: string
  bio: string | null
  profile_photo_url: string | null
  years_experience: number
  services: string[]
  disciplines: string[]
  has_own_transport: boolean
  rates_per_day: string | null
  availability_notes: string | null
  references_available: boolean
}

export function CaretakerEditDrawer({ open, onClose, data }: {
  open: boolean
  onClose: () => void
  data: CaretakerEditProps
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState(data.full_name)
  const [phone, setPhone] = useState(data.phone ?? '')
  const [location, setLocation] = useState(data.location)
  const [bio, setBio] = useState(data.bio ?? '')
  const [yearsExp, setYearsExp] = useState(String(data.years_experience))
  const [services, setServices] = useState<string[]>(data.services ?? [])
  const [disciplines, setDisciplines] = useState<string[]>(data.disciplines ?? [])
  const [hasTransport, setHasTransport] = useState(data.has_own_transport)
  const [ratesPerDay, setRatesPerDay] = useState(data.rates_per_day ?? '')
  const [availabilityNotes, setAvailabilityNotes] = useState(data.availability_notes ?? '')
  const [referencesAvailable, setReferencesAvailable] = useState(data.references_available)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setFullName(data.full_name)
      setPhone(data.phone ?? '')
      setLocation(data.location)
      setBio(data.bio ?? '')
      setYearsExp(String(data.years_experience))
      setServices(data.services ?? [])
      setDisciplines(data.disciplines ?? [])
      setHasTransport(data.has_own_transport)
      setRatesPerDay(data.rates_per_day ?? '')
      setAvailabilityNotes(data.availability_notes ?? '')
      setReferencesAvailable(data.references_available)
      setPhotoFile(null)
      setPhotoPreview(null)
      setError('')
    }
  }, [open, data])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true)
    setError('')

    let photo: { base64: string; mimeType: string; extension: string } | undefined
    if (photoFile) {
      const base64 = await new Promise<string>(resolve => {
        const reader = new FileReader()
        reader.onloadend = () => resolve((reader.result as string).split(',')[1])
        reader.readAsDataURL(photoFile)
      })
      const ext = photoFile.name.split('.').pop() ?? 'jpg'
      photo = { base64, mimeType: photoFile.type, extension: ext }
    }

    const result = await updateCaretakerProfile(data.id, {
      fullName,
      phone,
      location,
      bio,
      yearsExperience: parseInt(yearsExp) || 0,
      services,
      disciplines,
      hasOwnTransport: hasTransport,
      ratesPerDay,
      availabilityNotes,
      referencesAvailable,
      photo,
    })
    setSaving(false)
    if ('error' in result) {
      setError(result.error ?? 'Something went wrong')
    } else {
      router.refresh()
      onClose()
    }
  }

  const displayPhoto = photoPreview ?? data.profile_photo_url
  const initials = data.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <DrawerShell open={open} onClose={onClose} title="Edit Caretaker Profile" onSave={handleSave} saving={saving}>
      <SectionDivider label="Your Details" />

      <Field label="Profile Photo">
        <div className="flex items-center gap-4 mt-1">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-[#2D5016]/[0.08] flex items-center justify-center flex-shrink-0">
            {displayPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-lg font-bold text-[#2D5016]/30">{initials}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-full border border-[#2D5016]/30 text-[#2D5016] font-sans text-sm font-medium hover:bg-[#2D5016]/[0.04] transition-colors"
          >
            {photoFile ? 'Change Photo' : 'Upload Photo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      </Field>

      <Field label="Full Name"><Input value={fullName} onChange={setFullName} /></Field>
      <Field label="Phone"><Input value={phone} onChange={setPhone} type="tel" placeholder="Optional" /></Field>
      <Field label="Location"><Input value={location} onChange={setLocation} placeholder="City, State" /></Field>
      <Field label="Bio">
        <Textarea value={bio} onChange={setBio} placeholder="Tell owners about your experience…" rows={4} />
      </Field>

      <SectionDivider label="Experience" />
      <Field label="Years of Experience"><Input value={yearsExp} onChange={setYearsExp} type="number" /></Field>
      <Field label="Daily Rate"><Input value={ratesPerDay} onChange={setRatesPerDay} placeholder="e.g. $75 / day" /></Field>
      <Field label="Services"><CheckboxList options={SERVICES} selected={services} onChange={setServices} /></Field>
      <Field label="Disciplines"><CheckboxList options={DISCIPLINES} selected={disciplines} onChange={setDisciplines} /></Field>

      <SectionDivider label="Availability" />
      <Field label="Availability Notes">
        <Textarea value={availabilityNotes} onChange={setAvailabilityNotes} placeholder="When are you typically available?" rows={3} />
      </Field>
      <div className="space-y-3 bg-[#FAF9F6] rounded-xl p-4">
        <Toggle checked={hasTransport} onChange={setHasTransport} label="Has own transport" />
        <div className="h-px bg-[#e5e7eb]" />
        <Toggle checked={referencesAvailable} onChange={setReferencesAvailable} label="References available" />
      </div>

      {error && <p className="font-sans text-sm text-red-600">{error}</p>}
    </DrawerShell>
  )
}
