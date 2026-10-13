'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl') || '/book'
  const bannedUntil = searchParams.get('until')
  const bannedDate = bannedUntil && !Number.isNaN(new Date(bannedUntil).getTime())
    ? new Date(bannedUntil).toLocaleDateString('no-NO')
    : null

  const errorMessage =
    error === 'Banned'
      ? `Kontoen din er utestengt${bannedDate ? ` til ${bannedDate}` : ''}. Kontakt klubben hvis du mener dette er feil.`
      : error === 'OAuthCallback' || error === 'OAuthSignin'
        ? 'Kunne ikke koble til Google. Prøv igjen, eller kontakt administrator.'
        : error === 'OAuthAccountNotLinked'
          ? 'E-postadressen er allerede registrert med en annen innloggingsmetode.'
          : 'Noe gikk galt under innlogging. Prøv igjen.'
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-10 p-8 sm:p-12 bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-gray-100">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-3xl mb-6">
          <ShieldCheck className="h-10 w-10 text-blue-600" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
          Velkommen
        </h1>
        <p className="mt-4 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">
          Logg inn for å booke squash-bane
        </p>
      </div>

      <div className="space-y-6">
        {error && (
          <div role="alert" className="rounded-2xl bg-red-50 p-5 flex items-start gap-3 border border-red-100">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm font-bold text-red-900 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-4 rounded-[1.5rem] bg-gray-900 px-6 py-5 text-sm font-black text-white shadow-2xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em]"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="currentColor"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="currentColor"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="currentColor"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="currentColor"
              />
            </svg>
          )}
          <span>Fortsett med Google</span>
        </button>

        <p className="text-center text-[11px] font-bold text-gray-500 uppercase tracking-widest pt-4">
          Trygg innlogging med Google OAuth 2.0
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex min-h-[calc(100vh-100px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<Loader2 className="animate-spin h-10 w-10 text-blue-600" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
