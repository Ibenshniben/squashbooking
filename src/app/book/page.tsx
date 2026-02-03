'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { format, addDays, startOfToday, isSameDay, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

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
}

export default function BookingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
  const [courts, setCourts] = useState<Court[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState<string | null>(null)
  const [durationMinutes, setDurationMinutes] = useState<number>(60)

  useEffect(() => {
    // allow unauthenticated users to view bookings
  }, [status])

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
      setBookings(data)
    } catch (error) {
      console.error('Failed to fetch bookings', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async (courtId: string, minutesFromMidnight: number) => {
    if (!session) {
      router.push('/api/auth/signin')
      return
    }

    const startTime = new Date(selectedDate)
    const hours = Math.floor(minutesFromMidnight / 60)
    const minutes = minutesFromMidnight % 60
    startTime.setHours(hours, minutes, 0, 0)

    setBookingLoading(`${courtId}-${minutesFromMidnight}`)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courtId,
          startTime: startTime.toISOString(),
          durationMinutes,
        }),
      })

      if (res.ok) {
        await fetchBookings(selectedDate)
      } else {
        const error = await res.json()
        alert(error.error || 'Booking failed')
      }
    } catch (error) {
      console.error('Booking failed', error)
      alert('Something went wrong')
    } finally {
      setBookingLoading(null)
    }
  }

  const timeSlots = Array.from({ length: ((22 - 6) * 2) }, (_, i) => 6 * 60 + i * 30) // minutes from 06:00 to 21:30

  const isBooked = (courtId: string, minutesFromMidnight: number) => {
    const slotStart = new Date(selectedDate)
    slotStart.setHours(Math.floor(minutesFromMidnight / 60), minutesFromMidnight % 60, 0, 0)
    const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000)
    return bookings.some(booking => {
      const start = parseISO(booking.startTime)
      const end = parseISO(booking.endTime)
      return booking.courtId === courtId && start < slotEnd && end > slotStart
    })
  }

  const isMyBooking = (courtId: string, minutesFromMidnight: number) => {
    const slotStart = new Date(selectedDate)
    slotStart.setHours(Math.floor(minutesFromMidnight / 60), minutesFromMidnight % 60, 0, 0)
    const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000)
    return bookings.some(booking => {
      const start = parseISO(booking.startTime)
      const end = parseISO(booking.endTime)
      return booking.courtId === courtId && start < slotEnd && end > slotStart && booking.userId === session?.user?.id
    })
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Book Squash Bane</h1>
          
          {/* Date Selection */}
          <div className="flex space-x-2 overflow-x-auto pb-4">
            {Array.from({ length: 14 }).map((_, i) => {
              const date = addDays(startOfToday(), i)
              const isSelected = isSameDay(date, selectedDate)
              const now = startOfToday()
              const threeDaysAhead = addDays(now, 3)
              const beyondLimit = date > threeDaysAhead && session?.user?.role !== 'ADMIN'
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : `${beyondLimit ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`
                  }`}
                  disabled={beyondLimit}
                >
                  <div className="text-xs opacity-75 capitalize">{format(date, 'EEE', { locale: nb })}</div>
                  <div className="text-lg font-bold">{format(date, 'd. MMM', { locale: nb })}</div>
                </button>
              )
            })}
          </div>

          {/* Duration Selection */}
          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Varighet:</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value={30}>30 min</option>
              <option value={60}>1 time</option>
              <option value={90}>1,5 time</option>
              <option value={120}>2 timer</option>
              <option value={180}>3 timer</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-[80px_repeat(3,1fr)] divide-x divide-gray-200 border-b border-gray-200">
              <div className="p-4 bg-gray-50 font-medium text-gray-500 text-center">Tid</div>
              {courts.map(court => (
                <div key={court.id} className="p-4 bg-gray-50 font-bold text-gray-900 text-center">
                  {court.name}
                </div>
              ))}
            </div>

            <div className="divide-y divide-gray-200">
              {timeSlots.map(minutesFromMidnight => (
                <div key={minutesFromMidnight} className="grid grid-cols-[80px_repeat(3,1fr)] divide-x divide-gray-200">
                  <div className="p-4 flex items-center justify-center text-sm font-medium text-gray-500 bg-gray-50">
                    {String(Math.floor(minutesFromMidnight/60)).padStart(2, '0')}:{String(minutesFromMidnight%60).padStart(2, '0')}
                  </div>
                  {courts.map(court => {
                    const booked = isBooked(court.id, minutesFromMidnight)
                    const myBooking = isMyBooking(court.id, minutesFromMidnight)
                    const isLoading = bookingLoading === `${court.id}-${minutesFromMidnight}`
                    const now = startOfToday()
                    const threeDaysAhead = addDays(now, 3)
                    const beyondLimit = selectedDate > threeDaysAhead && session?.user?.role !== 'ADMIN'

                    return (
                      <div key={court.id} className="p-2 h-16">
                        {booked ? (
                          <div className={`w-full h-full rounded flex items-center justify-center text-sm font-medium ${
                            myBooking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {myBooking ? 'Din booking' : 'Opptatt'}
                          </div>
                        ) : (
                          session ? (
                            <button
                              onClick={() => handleBooking(court.id, minutesFromMidnight)}
                              disabled={isLoading || beyondLimit}
                              className="w-full h-full rounded border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center text-blue-600 font-medium disabled:opacity-50"
                            >
                              {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : (beyondLimit ? 'Utenfor grense' : 'Ledig')}
                            </button>
                          ) : (
                            <div className="w-full h-full rounded border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500 flex items-center justify-center text-sm">
                              Logg inn for å booke
                            </div>
                          )
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
    </div>
  )
}
