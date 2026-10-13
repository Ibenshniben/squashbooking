// Shared between the booking grid and the bookings API.
export const SLOT_MINUTES = 30
export const FIRST_SLOT_HOUR = 6
export const LAST_END_HOUR = 23
export const MAX_SLOTS_USER = 4
export const MAX_SLOTS_ADMIN = 10
export const MAX_DAYS_AHEAD_USER = 3
export const CANCEL_LIMIT_HOURS = 24

export const isAdminRole = (role?: string | null) => role === 'ADMIN' || role === 'SUPER_ADMIN'

// Minutes since midnight in club local time, independent of server timezone.
export function osloMinutes(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Oslo',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0)
  return get('hour') * 60 + get('minute')
}
