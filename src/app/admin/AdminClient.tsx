'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { approveCaretaker, rejectCaretaker } from './actions'

const SERVICE_LABELS: Record<string, string> = {
  feeding_turnout: 'Feeding & Turnout',
  riding_exercise: 'Riding & Exercise',
  overnight: 'Overnight Care',
}

interface PendingCaretaker {
  id: string
  full_name: string
  email: string
  location: string
  profile_photo_url: string | null
  created_at: string
  caretaker_profiles: {
    years_experience: number
    services: string[]
    bio: string | null
  } | {
    years_experience: number
    services: string[]
    bio: string | null
  }[] | null
}

interface UserRow {
  id: string
  full_name: string
  email: string
  location: string
  is_owner: boolean
  is_caretaker: boolean
  is_admin: boolean
  is_approved: boolean
  caretaker_status: string | null
  created_at: string
}

interface Stats {
  totalOwners: number
  totalCaretakers: number
  approvedCaretakers: number
  pendingCount: number
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function daysAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-0.5 h-4 bg-[#C9922A] flex-shrink-0" />
      <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/40">
        {label}
      </span>
    </div>
  )
}

export default function AdminClient({
  pending,
  allUsers,
  stats,
}: {
  pending: PendingCaretaker[]
  allUsers: UserRow[]
  stats: Stats
}) {
  const router = useRouter()
  const [loadingMap, setLoadingMap] = useState<Record<string, 'approving' | 'rejecting' | null>>({})

  async function handleApprove(id: string) {
    setLoadingMap(m => ({ ...m, [id]: 'approving' }))
    await approveCaretaker(id)
    router.refresh()
    setLoadingMap(m => ({ ...m, [id]: null }))
  }

  async function handleReject(id: string) {
    setLoadingMap(m => ({ ...m, [id]: 'rejecting' }))
    await rejectCaretaker(id)
    router.refresh()
    setLoadingMap(m => ({ ...m, [id]: null }))
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">

      {/* Page heading */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#1A1A1A] leading-tight mb-1">Admin</h1>
        <p className="font-sans text-sm text-[#1A1A1A]/40">HorseWatch management panel</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Owners', value: stats.totalOwners, gold: false },
          { label: 'Total Caretakers', value: stats.totalCaretakers, gold: false },
          { label: 'Approved Caretakers', value: stats.approvedCaretakers, gold: false },
          { label: 'Pending Review', value: stats.pendingCount, gold: stats.pendingCount > 0 },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm">
            <p className={`font-sans text-2xl font-bold mb-1 ${stat.gold ? 'text-[#C9922A]' : 'text-[#1A1A1A]'}`}>
              {stat.value}
            </p>
            <p className="font-sans text-xs text-[#1A1A1A]/40 uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Review */}
      <div className="mb-10">
        <SectionHeader label="Pending Review" />
        {pending.length === 0 ? (
          <p className="font-sans text-sm text-[#1A1A1A]/35">No caretakers pending review.</p>
        ) : (
          <div className="space-y-4">
            {pending.map(ct => {
              const cp = Array.isArray(ct.caretaker_profiles)
                ? ct.caretaker_profiles[0] ?? null
                : ct.caretaker_profiles
              const loading = loadingMap[ct.id]

              return (
                <div key={ct.id} className="bg-white rounded-2xl shadow-sm p-5">
                  {/* Top row */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[#2D5016]/[0.08] flex items-center justify-center">
                      {ct.profile_photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ct.profile_photo_url} alt={ct.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-sans text-xs font-bold text-[#2D5016]/50">
                          {getInitials(ct.full_name)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-[#1A1A1A] text-base leading-tight">{ct.full_name}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                        <span className="font-sans text-xs text-[#1A1A1A]/40">{ct.email}</span>
                        {ct.location && (
                          <span className="font-sans text-xs text-[#1A1A1A]/40 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {ct.location}
                          </span>
                        )}
                        <span className="font-sans text-xs text-[#1A1A1A]/30">Applied {daysAgo(ct.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {cp?.bio && (
                    <p className="font-sans text-sm text-[#1A1A1A]/60 leading-relaxed line-clamp-2 mb-3">
                      {cp.bio}
                    </p>
                  )}

                  {/* Services + experience */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {cp?.services?.map((s: string) => (
                      <span
                        key={s}
                        className="bg-[#2D5016]/[0.07] text-[#2D5016] text-xs font-sans font-medium rounded-full px-2.5 py-0.5"
                      >
                        {SERVICE_LABELS[s] ?? s}
                      </span>
                    ))}
                    {cp?.years_experience != null && (
                      <span className="text-xs text-[#1A1A1A]/50 font-sans">
                        {cp.years_experience} yr{cp.years_experience !== 1 ? 's' : ''} experience
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApprove(ct.id)}
                      disabled={!!loading}
                      className="bg-[#2D5016] text-white rounded-full px-5 py-2 text-sm font-sans font-semibold hover:bg-[#1e3710] transition-colors duration-150 disabled:opacity-60"
                    >
                      {loading === 'approving' ? 'Approving…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(ct.id)}
                      disabled={!!loading}
                      className="border border-red-300 text-red-600 rounded-full px-5 py-2 text-sm font-sans font-semibold hover:bg-red-50 transition-colors duration-150 disabled:opacity-60"
                    >
                      {loading === 'rejecting' ? 'Rejecting…' : 'Reject'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* All Users */}
      <div>
        <SectionHeader label="All Users" />
        <div className="overflow-x-auto rounded-2xl shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#e5e7eb]">
                {['Name', 'Email', 'Location', 'Roles', 'Status', 'Joined'].map(col => (
                  <th
                    key={col}
                    className="text-left py-3 px-4 text-xs font-sans font-semibold text-[#1A1A1A]/40 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allUsers.map(u => (
                <tr key={u.id} className="bg-white border-b border-[#f5f5f3] last:border-0">
                  <td className="py-3 px-4 font-sans text-sm font-medium text-[#1A1A1A] whitespace-nowrap">
                    {u.full_name}
                  </td>
                  <td className="py-3 px-4 font-sans text-sm text-[#1A1A1A]/55 whitespace-nowrap">
                    {u.email}
                  </td>
                  <td className="py-3 px-4 font-sans text-sm text-[#1A1A1A]/55 whitespace-nowrap">
                    {u.location || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {u.is_owner && (
                        <span className="bg-blue-50 text-blue-700 text-xs font-sans font-medium rounded px-2 py-0.5">Owner</span>
                      )}
                      {u.is_caretaker && (
                        <span className="bg-[#2D5016]/[0.08] text-[#2D5016] text-xs font-sans font-medium rounded px-2 py-0.5">Caretaker</span>
                      )}
                      {u.is_admin && (
                        <span className="bg-amber-50 text-amber-700 text-xs font-sans font-medium rounded px-2 py-0.5">Admin</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {u.is_caretaker && u.caretaker_status ? (
                      <span className={`text-xs font-sans font-medium rounded-full px-2.5 py-0.5 ${
                        u.caretaker_status === 'approved'
                          ? 'bg-green-50 text-green-700'
                          : u.caretaker_status === 'rejected'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {u.caretaker_status.charAt(0).toUpperCase() + u.caretaker_status.slice(1)}
                      </span>
                    ) : u.is_owner ? (
                      <span className="text-xs font-sans font-medium rounded-full px-2.5 py-0.5 bg-green-50 text-green-700">Active</span>
                    ) : (
                      <span className="text-[#1A1A1A]/30 text-sm">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-sans text-sm text-[#1A1A1A]/40 whitespace-nowrap">
                    {formatMonth(u.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
