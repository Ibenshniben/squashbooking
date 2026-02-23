'use client'

import { Header } from "@/components/layout/Header"
import { CheckCircle2, Info } from "lucide-react"

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
      description: "Ubegrenset spilletid sammen med familen eller andre med avtale.",
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">Prisoversikt</h1>
          <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Medlemskap og Avtaler</p>
        </div>

        <div className="bg-white rounded-[3rem] border border-gray-200 overflow-hidden shadow-2xl shadow-black/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Avtale</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Bindingstid</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Etablering</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Pris pr mnd</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Inkludert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {plans.map((plan, i) => (
                  <tr key={i} className={`hover:bg-gray-50/50 transition-colors ${plan.highlight ? 'bg-blue-50/20' : ''}`}>
                    <td className="px-8 py-10">
                      <div className="flex flex-col">
                        <span className="text-lg font-black uppercase italic tracking-tighter text-gray-900">{plan.name}</span>
                        {plan.highlight && (
                          <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full w-fit mt-2 uppercase tracking-widest">Anbefalt</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-10">
                      <span className="text-sm font-bold text-gray-600">{plan.binding}</span>
                    </td>
                    <td className="px-8 py-10">
                      <span className="text-sm font-bold text-gray-600">{plan.setup}</span>
                    </td>
                    <td className="px-8 py-10">
                      <span className="text-2xl font-black text-gray-900">{plan.price}</span>
                    </td>
                    <td className="px-8 py-10 max-w-sm">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-gray-500 leading-relaxed">{plan.description}</p>
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
            <h4 className="text-sm font-black uppercase tracking-widest mb-2">Viktig Informasjon</h4>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Alle våre avtaler gir tilgang til banereservasjon via dette systemet. 
              Kontakt Eyvind Strømsvåg for tegning av medlemskap eller spørsmål vedrørende avtaler.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
