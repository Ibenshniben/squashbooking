'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { format, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'

interface Booking {
  id: string
  startTime: string
  endTime: string
  court: {
    name: string
  }
  user: {
    name: string
    email: string
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date())
  const [tab, setTab] = useState<'bookings' | 'users'>('bookings')
  const [users, setUsers] = useState<{id:string,name:string|null,email:string|null,role:string,suspendedUntil:string|null}[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin')
    } else if (status === 'authenticated' && session.user.role !== 'ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user.role === 'ADMIN') {
      if (tab === 'bookings') {
        fetchBookings()
      } else {
        fetchUsers()
      }
    }
  }, [date, session, tab])

  const fetchBookings = async () => {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne bookingen?')) return

    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        fetchBookings()
      } else {
        alert('Kunne ikke slette booking')
      }
    } catch (error) {
      console.error('Failed to delete booking', error)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserDelete = async (id: string) => {
    if (!confirm('Slette bruker?')) return
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) fetchUsers()
    } catch (e) {
      console.error('Delete user failed', e)
    }
  }

  const handleTimeout5Days = async (id: string) => {
    try {
      const res = await fetch('/api/admin/users/timeout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, days: 5 })
      })
      if (res.ok) fetchUsers()
    } catch (e) {
      console.error('Timeout failed', e)
    }
  }

  const handleUnsuspend = async (id: string) => {
    try {
      const res = await fetch('/api/admin/users/unsuspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      })
      if (res.ok) fetchUsers()
    } catch (e) {
      console.error('Unsuspend failed', e)
    }
  }

  const handleExportCsv = async () => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd')
      const res = await fetch(`/api/admin/bookings/export?date=${formattedDate}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookings-${formattedDate}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export CSV failed', e)
    }
  }

  const toggleAdmin = async (id: string, role: string) => {
    try {
      const next = role === 'ADMIN' ? 'USER' : 'ADMIN'
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, role: next })
      })
      if (res.ok) fetchUsers()
    } catch (e) {
      console.error('Role change failed', e)
    }
  }

  if (status === 'loading' || (status === 'authenticated' && session.user.role !== 'ADMIN')) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="inline-flex rounded-md border border-gray-300 bg-white shadow-sm">
              <button
                onClick={() => setTab('bookings')}
                className={`px-5 py-2 text-base font-medium transition-colors ${
                  tab==='bookings'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Se Bookinger
              </button>
              <button
                onClick={() => setTab('users')}
                className={`px-5 py-2 text-base font-medium transition-colors ${
                  tab==='users'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Administrer Brukere
              </button>
            </div>
          </div>
          {tab==='bookings' && (
            <label className="flex items-center gap-2 text-gray-800">
              <span className="text-sm font-semibold">Velg dato:</span>
              <input
                type="date"
                value={format(date, 'yyyy-MM-dd')}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="border border-blue-600 text-gray-900 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button onClick={handleExportCsv} className="ml-4 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">Eksporter CSV</button>
            </label>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : (
          tab==='bookings' ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bane</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bruker</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Handling</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Ingen bookinger for denne dagen</td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(parseISO(booking.startTime), 'HH:mm')} - {format(parseISO(booking.endTime), 'HH:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.court.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="font-medium text-gray-900">{booking.user.name}</div>
                          <div>{booking.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleDelete(booking.id)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navn</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-post</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suspendert til</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Handling</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Ingen brukere</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.name ?? '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email ?? '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${u.role==='ADMIN'?'bg-blue-100 text-blue-800':'bg-gray-100 text-gray-700'}`}>{u.role==='ADMIN'?'Admin':'Bruker'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.suspendedUntil ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Suspendert til {format(parseISO(u.suspendedUntil), 'dd.MM.yyyy')}</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Aktiv</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-3 justify-end">
                          <button onClick={() => toggleAdmin(u.id, u.role)} className="text-blue-600 hover:text-blue-900">{u.role==='ADMIN'?'Fjern admin':'Gjør admin'}</button>
                          <button onClick={() => handleTimeout5Days(u.id)} className="text-orange-600 hover:text-orange-900">Timeout 5 dager</button>
                          {u.suspendedUntil && (
                            <button onClick={() => handleUnsuspend(u.id)} className="text-green-600 hover:text-green-900">Fjern timeout</button>
                          )}
                          <button onClick={() => handleUserDelete(u.id)} className="text-red-600 hover:text-red-900">Slett</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )
        )}
      </main>
    </div>
  )
}
