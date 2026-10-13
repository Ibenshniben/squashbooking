'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { format, addDays, startOfToday, isSameDay, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Clock, CheckCircle2, AlertCircle, Trash2, X } from 'lucide-react'
import {
  SLOT_MINUTES,
  FIRST_SLOT_HOUR,
  LAST_END_HOUR,
  MAX_SLOTS_USER,
  MAX_DAYS_AHEAD_USER,
  CANCEL_LIMIT_HOURS,
  isAdminRole,
} from '@/lib/booking-rules'

interface Court {
  id: string
  name: string
}

interface Booking {
  id: string
  startTime: string
  endTime: string
  courtId: string
  userId: string
  court?: Court
}

const SLOT_HOURS = SLOT_MINUTES / 60
const timeSlots = Array.from(
  { length: (LAST_END_HOUR - FIRST_SLOT_HOUR) / SLOT_HOURS },
  (_, i) => FIRST_SLOT_HOUR + i * SLOT_HOURS
)

const formatSlot = (time: number) =>
  `${String(Math.floor(time)).padStart(2, '0')}:${time % 1 === 0 ? '00' : '30'}`

const slotDate = (day: Date, time: number) => {
  const date = new Date(day)
  date.setHours(Math.floor(time), (time % 1) * 60, 0, 0)
  return date
}

export default function BookingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
  const [courts, setCourts] = useState<Court[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [myBookings, setMyBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState<{ courtId: string; time: number } | null>(null)
  const [selectedSlots, setSelectedSlots] = useState(1)
  const [now, setNow] = useState(() => new Date())

  const isAdmin = isAdminRole(session?.user.role)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/book')
    }
  }, [status, router])

  // Keeps past slots greyed out while the page stays open
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchBookings = useCallback(async (date: Date) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings?date=${format(date, 'yyyy-MM-dd')}`)
      const data = await res.json()
      setBookings(Array.isArray(data) ? data : [])
      setLoadError(!res.ok)
    } catch (error) {
      console.error('Failed to fetch bookings', error)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMyBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings?mine=1')
      const data = await res.json()
      setMyBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch own bookings', error)
    }
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/courts')
      .then(res => res.json())
      .then(data => setCourts(Array.isArray(data) ? data : []))
      .catch(error => console.error('Failed to fetch courts', error))
    fetchMyBookings()
  }, [status, fetchMyBookings])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetchBookings(selectedDate)
  }, [status, selectedDate, fetchBookings])

  const closeConfirm = useCallback(() => {
    setShowConfirm(null)
    setSelectedSlots(1)
    setBookingError(null)
  }, [])

  useEffect(() => {
    if (!showConfirm) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeConfirm()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [showConfirm, closeConfirm])

  const getBookingAtTime = (courtId: string, time: number) => {
    return bookings.find(booking => {
      const start = parseISO(booking.startTime)
      const end = parseISO(booking.endTime)
      const startT = start.getHours() + start.getMinutes() / 60
      const endT = end.getHours() + end.getMinutes() / 60
      return booking.courtId === courtId && time >= startT && time < endT
    })
  }

  // How many consecutive slots are free from this time, up to the booking limit
  const freeSlotsFrom = (courtId: string, time: number) => {
    let count = 0
    while (
      count < MAX_SLOTS_USER &&
      time + count * SLOT_HOURS < LAST_END_HOUR &&
      !getBookingAtTime(courtId, time + count * SLOT_HOURS)
    ) {
      count++
    }
    return count
  }

  const canCancel = (booking: Booking) =>
    isAdmin ||
    (booking.userId === session?.user?.id &&
      parseISO(booking.startTime).getTime() > now.getTime() + CANCEL_LIMIT_HOURS * 60 * 60 * 1000)

  const handleBooking = async () => {
    if (!showConfirm || !session) return

    const { courtId, time } = showConfirm
    setBookingLoading(true)
    setBookingError(null)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId,
          startTime: slotDate(selectedDate, time).toISOString(),
          slots: selectedSlots,
        }),
      })

      if (res.ok) {
        closeConfirm()
        fetchBookings(selectedDate)
        fetchMyBookings()
      } else {
        const error = await res.json().catch(() => null)
        setBookingError(error?.error || 'Booking feilet. Prøv igjen.')
        fetchBookings(selectedDate)
      }
    } catch (error) {
      console.error('Booking feilet', error)
      setBookingError('Fikk ikke kontakt med serveren. Sjekk nettforbindelsen og prøv igjen.')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCancelBooking = async (booking: Booking) => {
    const when = format(parseISO(booking.startTime), "EEEE d. MMMM 'kl.' HH:mm", { locale: nb })
    if (!confirm(`Vil du avbestille ${when}?`)) return

    try {
      const res = await fetch(`/api/bookings?id=${booking.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchBookings(selectedDate)
        fetchMyBookings()
      } else {
        const error = await res.json().catch(() => null)
        alert(error?.error || 'Kunne ikke avbestille')
      }
    } catch (error) {
      console.error('Cancel failed', error)
      alert('Fikk ikke kontakt med serveren. Prøv igjen.')
    }
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" role="status" aria-label="Laster">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" aria-hidden="true" />
      </div>
    )
  }

  const gridColumns = { gridTemplateColumns: `4.5rem repeat(${Math.max(courts.length, 1)}, minmax(0, 1fr))` }
  const confirmCourt = showConfirm && courts.find(c => c.id === showConfirm.courtId)
  const maxSlots = showConfirm ? freeSlotsFrom(showConfirm.courtId, showConfirm.time) : 0
  // Slots that have already ended are not worth scrolling past
  const visibleSlots = timeSlots.filter(time => slotDate(selectedDate, time + SLOT_HOURS) > now)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-gray-900 mb-4">Book Squash</h1>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-blue-900 font-medium">
            Hver økt er {SLOT_MINUTES} minutter.
            {!isAdmin && ` Du kan booke maksimalt ${MAX_DAYS_AHEAD_USER} dager frem i tid. Avbestilling må skje minst ${CANCEL_LIMIT_HOURS}t før.`}
          </p>
        </div>

        {myBookings.length > 0 && (
          <section aria-labelledby="mine-bookinger" className="mb-10">
            <h2 id="mine-bookinger" className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-4 italic">Mine kommende bookinger</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {myBookings.map(booking => (
                <li key={booking.id} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 pl-5 pr-2 py-2">
                  <button
                    onClick={() => setSelectedDate(new Date(new Date(booking.startTime).setHours(0, 0, 0, 0)))}
                    className="text-left py-2 rounded-lg min-w-0"
                  >
                    <span className="block text-sm font-black text-gray-900 capitalize truncate">
                      {format(parseISO(booking.startTime), 'EEEE d. MMM', { locale: nb })}
                    </span>
                    <span className="block text-sm font-medium text-gray-600 tabular-nums">
                      {format(parseISO(booking.startTime), 'HH:mm')}–{format(parseISO(booking.endTime), 'HH:mm')}
                      {booking.court && ` · ${booking.court.name}`}
                    </span>
                  </button>
                  {canCancel(booking) ? (
                    <button
                      onClick={() => handleCancelBooking(booking)}
                      aria-label={`Avbestill ${format(parseISO(booking.startTime), "EEEE d. MMMM 'kl.' HH:mm", { locale: nb })}`}
                      className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-gray-500 pr-3 shrink-0">Kan ikke avbestilles</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div role="group" aria-label="Velg dag" className="flex gap-3 overflow-x-auto pt-1 pb-6 -mx-4 px-4 sm:mx-0 sm:px-1 no-scrollbar">
          {Array.from({ length: isAdmin ? 14 : MAX_DAYS_AHEAD_USER + 1 }).map((_, i) => {
            const date = addDays(startOfToday(), i)
            const isSelected = isSameDay(date, selectedDate)

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                aria-pressed={isSelected}
                aria-label={format(date, 'EEEE d. MMMM', { locale: nb })}
                className={`flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center transition-colors border-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                    : 'bg-white text-gray-900 border-gray-200 hover:border-gray-400'
                }`}
              >
                <span className={`text-[11px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
                  {i === 0 ? 'I dag' : format(date, 'EEE', { locale: nb })}
                </span>
                <span className="text-2xl font-black tabular-nums">{format(date, 'd')}</span>
                <span className={`text-[11px] font-bold uppercase ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>{format(date, 'MMM', { locale: nb })}</span>
              </button>
            )
          })}
        </div>

        {loadError && (
          <div role="alert" className="mb-6 rounded-2xl bg-red-50 border border-red-100 p-4 flex items-center justify-between gap-4">
            <p className="flex items-start gap-3 text-sm font-bold text-red-900">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" aria-hidden="true" />
              Kunne ikke hente bookinger.
            </p>
            <button onClick={() => fetchBookings(selectedDate)} className="text-sm font-black text-red-900 underline underline-offset-4 shrink-0">
              Prøv igjen
            </button>
          </div>
        )}

        {visibleSlots.length === 0 ? (
          <p className="py-16 px-6 text-center text-sm font-bold text-gray-600 bg-gray-50 rounded-3xl border border-gray-200">
            Det er ingen flere tider denne dagen. Velg en annen dag over.
          </p>
        ) : courts.length === 0 ? (
          <div className="flex justify-center py-24 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200" role="status" aria-label="Laster baner">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600" aria-hidden="true" />
          </div>
        ) : (
          <div
            aria-busy={loading}
            className={`bg-white rounded-3xl border border-gray-200 shadow-xl shadow-black/5 transition-opacity ${loading ? 'opacity-60' : ''}`}
          >
            <div style={gridColumns} className="grid sticky top-0 z-10 bg-gray-50 border-b border-gray-200 rounded-t-3xl">
              <div className="py-4 text-[11px] font-black text-gray-600 uppercase tracking-widest text-center border-r border-gray-200">Tid</div>
              {courts.map(court => (
                <div key={court.id} className="py-4 px-1 text-sm font-black text-gray-900 uppercase italic tracking-tight text-center border-r border-gray-200 last:border-r-0 truncate">
                  {court.name}
                </div>
              ))}
            </div>

            <div className="divide-y divide-gray-100">
              {visibleSlots.map(time => (
                  <div key={time} style={gridColumns} className="grid">
                    <div className="flex items-center justify-center text-xs font-black text-gray-900 tabular-nums bg-gray-50 border-r border-gray-200">
                      {formatSlot(time)}
                    </div>
                    {courts.map(court => {
                      const booking = getBookingAtTime(court.id, time)
                      const myBooking = booking?.userId === session?.user?.id
                      const label = `${court.name} kl. ${formatSlot(time)}`

                      return (
                        <div key={court.id} className="p-1.5 h-14 border-r border-gray-100 last:border-r-0">
                          {booking ? (
                            canCancel(booking) ? (
                              <button
                                onClick={() => handleCancelBooking(booking)}
                                aria-label={`Avbestill ${label}`}
                                className={`w-full h-full rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider transition-colors hover:bg-red-600 hover:text-white ${
                                  myBooking ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {myBooking ? 'Din' : 'Opptatt'}
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            ) : (
                              <div className={`w-full h-full rounded-xl flex items-center justify-center text-[11px] font-black uppercase tracking-wider ${
                                myBooking ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {myBooking ? 'Din' : 'Opptatt'}
                              </div>
                            )
                          ) : (
                            <button
                              onClick={() => setShowConfirm({ courtId: court.id, time })}
                              aria-label={`Book ${label}`}
                              className="w-full h-full rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center text-blue-700 font-black text-[11px] uppercase tracking-wider"
                            >
                              Ledig
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !bookingLoading) closeConfirm()
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bekreft-tittel"
            className="relative bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl border border-gray-100 animate-pop"
          >
            <button
              onClick={closeConfirm}
              aria-label="Lukk"
              className="absolute top-5 right-5 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8 text-blue-600" aria-hidden="true" />
              </div>
              <h2 id="bekreft-tittel" className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic mb-2">Bekreft booking</h2>
              <p className="text-gray-600 text-sm mb-8 font-medium">
                <span className="capitalize">{format(selectedDate, 'EEEE d. MMMM', { locale: nb })}</span><br />
                {confirmCourt?.name} · kl. {formatSlot(showConfirm.time)}–{formatSlot(showConfirm.time + Math.min(selectedSlots, maxSlots) * SLOT_HOURS)}
              </p>

              <fieldset className="w-full mb-8">
                <legend className="text-[11px] font-black uppercase tracking-widest text-gray-600 mb-4 mx-auto">Hvor lenge skal du spille?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: MAX_SLOTS_USER }, (_, i) => i + 1).map(slots => (
                    <button
                      key={slots}
                      onClick={() => setSelectedSlots(slots)}
                      disabled={slots > maxSlots}
                      aria-pressed={selectedSlots === slots}
                      className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors border-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:line-through ${
                        selectedSlots === slots
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-gray-900 border-gray-200 enabled:hover:border-gray-400'
                      }`}
                    >
                      {slots * SLOT_MINUTES} min
                    </button>
                  ))}
                </div>
              </fieldset>

              {bookingError && (
                <p role="alert" className="w-full mb-4 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm font-bold text-red-900 text-left flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0" aria-hidden="true" />
                  {bookingError}
                </p>
              )}

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleBooking}
                  disabled={bookingLoading || selectedSlots > maxSlots}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[1.25rem] shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
                >
                  {bookingLoading && <Loader2 className="animate-spin h-4 w-4" aria-hidden="true" />}
                  {bookingLoading ? 'Booker...' : 'Bekreft booking'}
                </button>
                <button
                  onClick={closeConfirm}
                  className="w-full bg-white text-gray-600 font-bold py-4 rounded-xl hover:text-gray-900 transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
