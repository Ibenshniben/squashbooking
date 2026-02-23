'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { format, addDays, startOfToday, isSameDay, parseISO, addMinutes, isAfter } from 'date-fns'
import { nb } from 'date-fns/locale'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

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
  user?: {
    id: string
    name: string
  }
}

export default function BookingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
  const [courts, setCourts] = useState<Court[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState<{ courtId: string; time: number } | null>(null)
  const [selectedSlots, setSelectedSlots] = useState(1)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchCourts()
  }, [])

  useEffect(() => {
    fetchBookings(selectedDate)
  }, [selectedDate])

  const fetchCourts = async () => {
    try {
      const res = await fetch('/api/courts')
      const data = await res.json()
      setCourts(data)
    } catch (error) {
      console.error('Failed to fetch courts', error)
    }
  }

  const fetchBookings = async (date: Date) => {
    setLoading(true)
    try {
      const formattedDate = format(date, 'yyyy-MM-dd')
      const res = await fetch(`/api/bookings?date=${formattedDate}`)
      const data = await res.json()
      setBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch bookings', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!showConfirm || !session) return

    const { courtId, time } = showConfirm
    const hours = Math.floor(time)
    const minutes = (time % 1) * 60

    const startTime = new Date(selectedDate)
    startTime.setHours(hours, minutes, 0, 0)

    setBookingLoading(`${courtId}-${time}`)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId,
          startTime: startTime.toISOString(),
          slots: selectedSlots,
        }),
      })

      if (res.ok) {
        await fetchBookings(selectedDate)
        setShowConfirm(null)
        setSelectedSlots(1)
      } else {
        const error = await res.json()
        alert(error.error || 'Booking feilet')
      }
    } catch (error) {
      console.error('Booking feilet', error)
      alert('Noe gikk galt')
    } finally {
      setBookingLoading(null)
    }
  }

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Er du sikker på at du vil avbestille?')) return

    try {
      const res = await fetch(`/api/bookings?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchBookings(selectedDate)
      } else {
        const error = await res.json()
        alert(error.error || 'Kunne ikke avbestille')
      }
    } catch (error) {
      console.error('Cancel failed', error)
    }
  }

  const timeSlots = Array.from({ length: 34 }, (_, i) => 6 + i * 0.5)

  const getBookingAtTime = (courtId: string, time: number) => {
    return bookings.find(booking => {
      const start = parseISO(booking.startTime)
      const end = parseISO(booking.endTime)
      const startT = start.getHours() + start.getMinutes() / 60
      const endT = end.getHours() + end.getMinutes() / 60
      return booking.courtId === courtId && time >= startT && time < endT
    })
  }

  const isAdmin = session?.user.role === 'ADMIN' || session?.user.role === 'SUPER_ADMIN'

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-gray-900">Book Squash</h1>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8 flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900 font-medium">
              Hver økt er 30 minutter. 
              {!isAdmin && " Du kan booke maksimalt 3 dager frem i tid. Avbestilling må skje minst 24t før."}
            </div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
            {Array.from({ length: isAdmin ? 14 : 4 }).map((_, i) => {
              const date = addDays(startOfToday(), i)
              const isSelected = isSameDay(date, selectedDate)
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>{format(date, 'EEE', { locale: nb })}</span>
                  <span className="text-2xl font-black">{format(date, 'd')}</span>
                  <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>{format(date, 'MMM', { locale: nb })}</span>
                </button>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-gray-200 overflow-x-auto shadow-xl shadow-black/5">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-[100px_repeat(3,1fr)] bg-gray-50 border-b border-gray-200">
                <div className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center border-r border-gray-200">Tid</div>
                {courts.map(court => (
                  <div key={court.id} className="p-6 text-sm font-black text-gray-900 uppercase italic tracking-tighter text-center border-r border-gray-200 last:border-r-0">
                    {court.name}
                  </div>
                ))}
              </div>

              <div className="divide-y divide-gray-100">
                {timeSlots.map(time => (
                  <div key={time} className="grid grid-cols-[100px_repeat(3,1fr)]">
                    <div className="p-6 flex items-center justify-center text-xs font-black text-gray-900 bg-gray-50 border-r border-gray-200">
                      {String(Math.floor(time)).padStart(2, '0')}:{time % 1 === 0 ? '00' : '30'}
                    </div>
                    {courts.map(court => {
                      const booking = getBookingAtTime(court.id, time)
                      const myBooking = booking?.userId === session?.user?.id
                      const isLoading = bookingLoading === `${court.id}-${time}`
                      const isMoreThan24h = booking ? isAfter(parseISO(booking.startTime), new Date(new Date().getTime() + 24 * 60 * 60 * 1000)) : false
                      const canCancel = (myBooking && isMoreThan24h) || isAdmin

                      return (
                        <div key={court.id} className="p-2 h-20 border-r border-gray-100 last:border-r-0">
                          {booking ? (
                            <div className={`w-full h-full rounded-xl flex flex-col items-center justify-center text-[10px] font-black uppercase tracking-widest relative overflow-hidden group ${
                              myBooking ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'
                            }`}>
                              <span>{myBooking ? 'Din' : 'Opptatt'}</span>
                              {canCancel && (
                                <button 
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="absolute inset-0 bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="text-[8px]">Slett</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowConfirm({ courtId: court.id, time })}
                              disabled={isLoading}
                              className="w-full h-full rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center text-blue-600 font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                            >
                              {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Ledig'}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic mb-2">Bekreft booking</h3>
              <p className="text-gray-600 text-sm mb-8 font-medium">
                {courts.find(c => c.id === showConfirm.courtId)?.name} <br/>
                kl. {String(Math.floor(showConfirm.time)).padStart(2, '0')}:{showConfirm.time % 1 === 0 ? '00' : '30'}
              </p>

              <div className="w-full mb-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 block">Hvor lenge skal du spille?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map(slots => (
                    <button
                      key={slots}
                      onClick={() => setSelectedSlots(slots)}
                      className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                        selectedSlots === slots 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'bg-white text-gray-900 border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {slots * 30} min
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleBooking}
                  disabled={bookingLoading !== null}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[1.25rem] shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                >
                  {bookingLoading ? 'Booker...' : 'Bekreft booking'}
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(null)
                    setSelectedSlots(1)
                  }}
                  className="w-full bg-white text-gray-500 font-bold py-4 rounded-xl hover:text-gray-900 transition-colors"
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
