'use client'

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogOut, LayoutDashboard, Calendar, Tag } from "lucide-react"
import { useState } from "react"

const links = [
  { href: '/book', label: 'Book Bane', icon: Calendar },
  { href: '/pricing', label: 'Priser', icon: Tag },
  { href: '/admin', label: 'Admin', icon: LayoutDashboard, adminOnly: true },
]

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)

  const isAdmin = session?.user.role === 'ADMIN' || session?.user.role === 'SUPER_ADMIN'
  const visibleLinks = links.filter(link => !link.adminOnly || isAdmin)

  return (
    <header className="bg-white border-b border-gray-200">
      <nav aria-label="Hovedmeny" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center rounded-lg">
              <img src="/img.png" alt="Søm Squash – til forsiden" width={165} height={133} className="h-14 w-auto object-contain" />
            </Link>
          </div>

          <div className="hidden md:ml-6 md:flex md:items-center gap-2">
            {visibleLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
                    active ? 'text-blue-600' : 'text-gray-900 hover:text-blue-600'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </Link>
              )
            })}

            {session ? (
              <div className="ml-2 flex items-center gap-4 border-l border-gray-200 pl-5">
                <div className="flex max-w-[260px] min-w-0 items-center gap-3 py-2">
                  {session.user.image && !avatarFailed ? (
                    <img
                      src={session.user.image}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarFailed(true)}
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700"
                    >
                      {(session.user.name?.trim().charAt(0) || 'K').toLocaleUpperCase('nb-NO')}
                    </span>
                  )}
                  <div className="flex min-w-0 flex-col text-left">
                    <span className="truncate text-xs font-extrabold leading-tight text-gray-900">{session.user.name || 'Konto'}</span>
                    {session.user.email && (
                      <span className="mt-0.5 truncate text-[11px] font-medium text-gray-500">{session.user.email}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex min-h-12 items-center gap-2 rounded-xl bg-gray-900 px-4 text-[11px] font-black uppercase tracking-widest text-white transition-colors hover:bg-gray-700 focus-visible:outline-offset-4"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Logg ut</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-600/20"
              >
                Logg inn
              </Link>
            )}
          </div>

          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobilmeny"
              aria-label={isOpen ? 'Lukk meny' : 'Åpne meny'}
              className="inline-flex items-center justify-center p-3 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div id="mobilmeny" className="md:hidden bg-white border-t border-gray-100 p-4 space-y-2 animate-slide-down">
          {visibleLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              aria-current={pathname === href ? 'page' : undefined}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-gray-900 hover:bg-gray-50 transition-colors ${
                pathname === href ? 'bg-gray-50' : ''
              }`}
            >
              <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
              {label}
            </Link>
          ))}

          {session ? (
            <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
              <div className="flex min-w-0 items-center gap-3 px-4">
                {session.user.image && !avatarFailed ? (
                  <img
                    src={session.user.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarFailed(true)}
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700"
                  >
                    {(session.user.name?.trim().charAt(0) || 'K').toLocaleUpperCase('nb-NO')}
                  </span>
                )}
                <div className="flex min-w-0 flex-col">
                  <p className="truncate text-sm font-bold text-gray-900">{session.user.name || 'Konto'}</p>
                  {session.user.email && (
                    <p className="mt-0.5 truncate text-xs font-medium text-gray-500">{session.user.email}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-900 px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-gray-700"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                <span>Logg ut</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="block w-full text-center py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white bg-blue-600 shadow-xl shadow-blue-600/20"
            >
              Logg inn
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
