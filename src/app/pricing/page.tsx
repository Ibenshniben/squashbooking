import type { Metadata } from "next"
import { Header } from "@/components/layout/Header"
import { CheckCircle2, Info } from "lucide-react"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Priser og medlemskap",
  description: `Prisoversikt for ${site.legalName} i ${site.city}: Standard, Familie, Student/Junior og enkeltmåned. Alle avtaler gir tilgang til banebooking på nett.`,
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: `Priser og medlemskap | ${site.name}`,
    description: `Medlemskap og avtaler hos ${site.legalName} i ${site.city}.`,
    url: "/pricing",
  },
}

export default function PricingPage() {
  const plans = [
    {
      name: "Standard",
      binding: "12 mnd",
      price: "249,-",
      setup: "200,-",
      description: "Ubegrenset spilletid sammen med andre med avtale."
    },
    {
      name: "Familie",
      binding: "12 mnd",
      price: "349,-",
      setup: "200,-",
      description: "Ubegrenset spilletid sammen med familien eller andre med avtale.",
      highlight: true
    },
    {
      name: "Student / Junior",
      binding: "12 mnd",
      price: "199,-",
      setup: "200,-",
      description: "Ubegrenset spilletid."
    },
    {
      name: "Enkeltmåned",
      binding: "Ingen",
      price: "500,-",
      setup: "100,-",
      description: "Gjelder fra dato til dato. Betales på forskudd."
    },
    {
      name: "Enkeltmåned Familie",
      binding: "Ingen",
      price: "700,-",
      setup: "100,-",
      description: "Gjelder fra dato til dato. Betales på forskudd."
    }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-12 md:mb-20">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">Prisoversikt</h1>
          <p className="text-sm font-black text-gray-500 uppercase tracking-[0.3em]">Medlemskap og Avtaler</p>
        </div>

        {/* Mobile: one card per plan */}
        <ul className="md:hidden space-y-4">
          {plans.map((plan) => (
            <li key={plan.name} className={`rounded-[2rem] border p-6 ${plan.highlight ? 'border-blue-200 bg-blue-50/40' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-black uppercase italic tracking-tight text-gray-900">{plan.name}</h2>
                <p className="text-2xl font-black text-gray-900 tabular-nums whitespace-nowrap">{plan.price} <span className="text-xs font-bold text-gray-500">/ mnd</span></p>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-[11px] font-black uppercase tracking-widest text-gray-500">Bindingstid</dt>
                  <dd className="font-bold text-gray-900 mt-1">{plan.binding}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-black uppercase tracking-widest text-gray-500">Etablering</dt>
                  <dd className="font-bold text-gray-900 mt-1 tabular-nums">{plan.setup}</dd>
                </div>
              </dl>
              <p className="mt-4 flex items-start gap-3 text-sm font-medium text-gray-600 leading-relaxed">
                <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                {plan.description}
              </p>
            </li>
          ))}
        </ul>

        <div className="hidden md:block bg-white rounded-[3rem] border border-gray-200 overflow-hidden shadow-2xl shadow-black/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th scope="col" className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Avtale</th>
                  <th scope="col" className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Bindingstid</th>
                  <th scope="col" className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Etablering</th>
                  <th scope="col" className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Pris pr mnd</th>
                  <th scope="col" className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Inkludert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {plans.map((plan) => (
                  <tr key={plan.name} className={`hover:bg-gray-50/50 transition-colors ${plan.highlight ? 'bg-blue-50/20' : ''}`}>
                    <td className="px-8 py-8">
                      <div className="flex flex-col">
                        <span className="text-lg font-black uppercase italic tracking-tighter text-gray-900">{plan.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className="text-sm font-bold text-gray-600">{plan.binding}</span>
                    </td>
                    <td className="px-8 py-8">
                      <span className="text-sm font-bold text-gray-600">{plan.setup}</span>
                    </td>
                    <td className="px-8 py-8">
                      <span className="text-2xl font-black text-gray-900 tabular-nums">{plan.price}</span>
                    </td>
                    <td className="px-8 py-8 max-w-sm">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-gray-600 leading-relaxed">{plan.description}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer / Additional Info */}
        <div className="mt-12 bg-gray-50 p-8 rounded-[2rem] border border-gray-100 flex items-start gap-4 max-w-3xl mx-auto">
          <Info className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest mb-2">Viktig Informasjon</h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Alle våre avtaler gir tilgang til banereservasjon via dette systemet. 
              Kontakt {site.contactName} på{' '}
              <a href={`tel:${site.phone}`} className="font-bold text-blue-600 hover:underline underline-offset-2 whitespace-nowrap">{site.phoneDisplay}</a>{' '}
              for tegning av medlemskap eller spørsmål vedrørende avtaler.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
