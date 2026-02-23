'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { format, parseISO, addDays } from 'date-fns'
import { nb } from 'date-fns/locale'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, Users, Calendar, ShieldAlert, Ban, Clock, CheckCircle, Zap, X, ChevronRight } from 'lucide-react'

interface Booking {
  id: string
  startTime: string
  endTime: string
  court: {
    name: string
  }
  user: {
    id: string
    name: string
    email: string
  }
}

interface Court {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  bannedUntil: string | null
  image: string | null
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'bookings' | 'users'>('bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date())
  
  // Fast Booking State
  const [showFastBooking, setShowFastBooking] = useState(false)
  const [fastBookingData, setFastBookingData] = useState({
    courtId: '',
    userId: '',
    startTime: '',
    slots: 3, // Default 90 min (3 * 30 min)
    isRecurring: false,
    weeks: 4
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user.role === 'ADMIN' || session?.user.role === 'SUPER_ADMIN') {
      fetchData()
    }
  }, [date, activeTab, session])

  const fetchData = async () => {
    setLoading(true)
    try {
      const formattedDate = format(date, 'yyyy-MM-dd')
      const [bookingsRes, usersRes, courtsRes] = await Promise.all([
        fetch(`/api/bookings?date=${formattedDate}`),
        fetch('/api/admin/users'),
        fetch('/api/courts')
      ])
      
      const [bookingsData, usersData, courtsData] = await Promise.all([
        bookingsRes.json(),
        usersRes.json(),
        courtsRes.json()
      ])

      setBookings(Array.isArray(bookingsData) ? bookingsData : [])
      setUsers(Array.isArray(usersData) ? usersData : [])
      setCourts(Array.isArray(courtsData) ? courtsData : [])
    } catch (error) {
      console.error('Failed to fetch data', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFastBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fastBookingData,
          startTime: new Date(fastBookingData.startTime).toISOString()
        })
      })

      if (res.ok) {
        setShowFastBooking(false)
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Intervall-booking feilet')
      }
    } catch (error) {
      console.error('Fast booking failed', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne bookingen?')) return

    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchData()
      } else {
        alert('Kunne ikke slette booking')
      }
    } catch (error) {
      console.error('Failed to delete booking', error)
    }
  }

  const handleBanUser = async (userId: string, days: number | null) => {
    let bannedUntil = null
    if (days !== null) {
      bannedUntil = addDays(new Date(), days).toISOString()
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bannedUntil })
      })

      if (res.ok) {
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Kunne ikke oppdatere bruker')
      }
    } catch (error) {
      console.error('Failed to update user', error)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })

      if (res.ok) {
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Kunne ikke oppdatere rolle')
      }
    } catch (error) {
      console.error('Failed to update role', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne brukeren permanent?')) return

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Kunne ikke slette bruker')
      }
    } catch (error) {
      console.error('Failed to delete user', error)
    }
  }

  if (status === 'loading' || (status === 'authenticated' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-gray-900">Dashboard</h1>
            <p className="text-gray-900 text-xs font-black uppercase tracking-widest mt-1">Administrasjon v2.1</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowFastBooking(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 w-full md:w-auto"
            >
              <Zap className="h-4 w-4 fill-white" />
              Intervall-booking
            </button>

            <div className="flex bg-gray-50 p-1.5 rounded-xl border-2 border-gray-100 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'bookings' ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Bookinger
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Users className="h-4 w-4" />
                Brukere
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'bookings' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-gray-900">Aktive Bookinger</h2>
              </div>
              <input
                type="date"
                value={format(date, 'yyyy-MM-dd')}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="bg-white border-2 border-gray-100 rounded-xl px-5 py-3 text-sm font-black text-gray-900 shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all cursor-pointer w-full sm:w-auto"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-24 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-gray-200 overflow-x-auto shadow-2xl shadow-black/5">
                <table className="min-w-[700px] divide-y divide-gray-100">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Tidspunkt</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Bane</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Medlem</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Handlinger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-24 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                          Ingen bookinger funnet for denne dagen
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-[10px] font-black tracking-widest border border-gray-800 shadow-md">
                              {format(parseISO(booking.startTime), 'HH:mm')} - {format(parseISO(booking.endTime), 'HH:mm')}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className="text-sm font-black text-gray-900 uppercase italic tracking-tighter">
                              {booking.court.name}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-gray-900 leading-tight">{booking.user.name}</span>
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{booking.user.email}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="p-3.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8">
            <h2 className="text-xl font-black uppercase tracking-tighter italic text-gray-900">Brukeroversikt</h2>

            <div className="bg-white rounded-[2.5rem] border border-gray-200 overflow-x-auto shadow-2xl shadow-black/5">
              <table className="min-w-[800px] divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Profil</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Rolle</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Handling</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => {
                    const isBanned = user.bannedUntil && new Date(user.bannedUntil) > new Date()
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            {user.image ? (
                              <img src={user.image} alt="" className="h-10 w-10 rounded-2xl border-2 border-gray-100 shadow-sm" />
                            ) : (
                              <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm border-2 border-blue-500 shadow-lg shadow-blue-600/10">
                                {user.name?.charAt(0) || 'U'}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-gray-900 leading-tight">{user.name}</span>
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          {isBanned ? (
                            <div className="flex items-center gap-2 text-[10px] font-black text-red-600 bg-red-50 px-4 py-2 rounded-full border border-red-100 w-fit uppercase tracking-widest">
                              <Ban className="h-3 w-3" />
                              Bannet til {format(parseISO(user.bannedUntil!), 'dd.MM')}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100 w-fit uppercase tracking-widest">
                              <CheckCircle className="h-3 w-3" />
                              Aktiv Bruker
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          {session?.user.role === 'SUPER_ADMIN' && user.id !== session?.user.id ? (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border border-gray-200 bg-white outline-none focus:ring-4 focus:ring-blue-50 cursor-pointer transition-all"
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            </select>
                          ) : (
                            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-2 shadow-sm ${
                              user.role === 'SUPER_ADMIN' ? 'text-red-700 bg-red-50 border-red-100' :
                              user.role === 'ADMIN' ? 'text-blue-700 bg-blue-50 border-blue-100' : 
                              'text-gray-900 bg-gray-50 border-gray-200'
                            }`}>
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(session?.user.role === 'SUPER_ADMIN' || user.role === 'USER') && user.id !== session?.user.id && (
                              <>
                                {isBanned ? (
                                  <button
                                    onClick={() => handleBanUser(user.id, null)}
                                    className="text-[10px] font-black text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-3 rounded-xl transition-all border-2 border-blue-100 hover:border-blue-600 uppercase tracking-widest"
                                  >
                                    Opphev
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <button onClick={() => handleBanUser(user.id, 1)} className="p-3 text-gray-300 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all border border-transparent hover:border-orange-100" title="Timeout 1 dag"><Clock className="h-4.5 w-4.5" /></button>
                                    <button onClick={() => handleBanUser(user.id, 3)} className="p-3 text-gray-300 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all border border-transparent hover:border-orange-100" title="Timeout 3 dager"><ShieldAlert className="h-4.5 w-4.5" /></button>
                                    <button onClick={() => handleBanUser(user.id, 5)} className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100" title="Timeout 5 dager"><Ban className="h-4.5 w-4.5" /></button>
                                  </div>
                                )}
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-3.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Fast Booking Modal */}
      {showFastBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative border border-gray-100 overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setShowFastBooking(false)}
              className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-900"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-7 w-7 text-blue-600 fill-blue-600" />
                <h3 className="text-3xl font-black tracking-tighter uppercase italic text-gray-900">Intervall-booking</h3>
              </div>
              <p className="text-gray-900 text-xs font-black uppercase tracking-widest opacity-40">Opprett gjentakende økter</p>
            </div>

            <form onSubmit={handleFastBooking} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-900 ml-1">Bruker</label>
                  <select
                    required
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all cursor-pointer"
                    value={fastBookingData.userId}
                    onChange={(e) => setFastBookingData({...fastBookingData, userId: e.target.value})}
                  >
                    <option value="">Søk etter medlem...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-900 ml-1">Bane</label>
                  <select
                    required
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all cursor-pointer"
                    value={fastBookingData.courtId}
                    onChange={(e) => setFastBookingData({...fastBookingData, courtId: e.target.value})}
                  >
                    <option value="">Velg bane...</option>
                    {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-3 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-900 ml-1">Tidspunkt</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all cursor-pointer"
                    value={fastBookingData.startTime}
                    onChange={(e) => setFastBookingData({...fastBookingData, startTime: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-900 ml-1">Økter (30min stk)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all"
                    value={fastBookingData.slots}
                    onChange={(e) => setFastBookingData({...fastBookingData, slots: parseInt(e.target.value)})}
                  />
                </div>

                <div className="flex items-end pb-4">
                  <label className="flex items-center gap-3 cursor-pointer group w-full">
                    <input
                      type="checkbox"
                      className="w-7 h-7 rounded-xl border-2 border-gray-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                      checked={fastBookingData.isRecurring}
                      onChange={(e) => setFastBookingData({...fastBookingData, isRecurring: e.target.checked})}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 group-hover:text-blue-600 transition-colors">Fast Gjentakelse</span>
                  </label>
                </div>

                {fastBookingData.isRecurring && (
                  <div className="space-y-3 sm:col-span-2 animate-in slide-in-from-top-4 duration-300">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-900 ml-1">Antall uker (1-52)</label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all"
                      value={fastBookingData.weeks}
                      onChange={(e) => setFastBookingData({...fastBookingData, weeks: parseInt(e.target.value)})}
                    />
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.3em] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                    <>
                      Fullfør Oppsett
                      <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
