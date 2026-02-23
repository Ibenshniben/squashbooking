'use client'

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Menu, X, LogOut, LayoutDashboard, Calendar, Tag } from "lucide-react"
import { useState } from "react"

export function Header() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const navLinkStyle = "flex items-center gap-2 text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all"

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Søm Squash</span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <Link href="/book" className={navLinkStyle}>
              <Calendar className="h-3.5 w-3.5" />
              Book Bane
            </Link>

            <Link href="/pricing" className={navLinkStyle}>
              <Tag className="h-3.5 w-3.5" />
              Priser
            </Link>
            
            {(session?.user.role === 'ADMIN' || session?.user.role === 'SUPER_ADMIN') && (
              <Link href="/admin" className={navLinkStyle}>
                <LayoutDashboard className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}

            {session ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-black text-gray-900 leading-none uppercase tracking-tighter">{session.user.name}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{session.user.email}</span>
                  <button
                    onClick={async () => {
                      if (confirm('Er du helt sikker? Dette kan ikke angres.')) {
                        const res = await fetch('/api/users/me', { method: 'DELETE' })
                        if (res.ok) signOut()
                      }
                    }}
                    className="text-[8px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest mt-2 transition-colors block"
                  >
                    Slett Konto
                  </button>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-red-600 text-white border-2 border-transparent px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all group shadow-xl shadow-black/5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logg ut</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-600/20"
              >
                Logg inn
              </Link>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-3 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <Link href="/book" className="flex items-center gap-4 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
            <Calendar className="h-5 w-5 text-blue-600" />
            Book Bane
          </Link>

          <Link href="/pricing" className="flex items-center gap-4 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
            <Tag className="h-5 w-5 text-blue-600" />
            Priser
          </Link>
          
          {(session?.user.role === 'ADMIN' || session?.user.role === 'SUPER_ADMIN') && (
            <Link href="/admin" className="flex items-center gap-4 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
              <LayoutDashboard className="h-5 w-5 text-blue-600" />
              Admin
            </Link>
          )}

          {session ? (
            <div className="pt-6 border-t border-gray-100 mt-6 space-y-6">
              <div className="px-4">
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">{session.user.name}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{session.user.email}</p>
                <button
                  onClick={async () => {
                    if (confirm('Er du helt sikker? Dette kan ikke angres.')) {
                      const res = await fetch('/api/users/me', { method: 'DELETE' })
                      if (res.ok) signOut()
                    }
                  }}
                  className="text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest mt-4 transition-colors block"
                >
                  Slett Min Konto
                </button>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-4 w-full px-4 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-gray-900 hover:bg-red-600 transition-all shadow-xl shadow-black/10"
              >
                <LogOut className="h-5 w-5" />
                <span>Logg ut</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="block w-full text-center py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 shadow-xl shadow-blue-600/20"
            >
              Logg inn
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
