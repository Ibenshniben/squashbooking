import Link from "next/link"
import { Phone, MapPin } from "lucide-react"
import { site } from "@/lib/site"

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Contact */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6 italic">Kontakt</h2>
            <address className="space-y-4 not-italic">
              <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{site.contactName}</p>
              <a href={`tel:${site.phone}`} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors w-fit">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {site.phoneDisplay}
              </a>
              <div className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                <MapPin className="h-4 w-4 mt-0.5 text-gray-400" aria-hidden="true" />
                <span>{site.street},<br />{site.postalCode} {site.city}</span>
              </div>
            </address>
          </div>

          {/* Opening Hours */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6 italic">Åpningstider</h2>
            <dl className="space-y-3">
              {site.hours.map((h) => (
                <div key={h.label} className="flex justify-between items-center gap-6 border-b border-gray-100 pb-2">
                  <dt className="text-xs font-bold text-gray-600 uppercase">{h.label}</dt>
                  <dd className="text-sm font-black text-gray-900 tabular-nums">{h.opens.replace(':', '.')} - {h.closes.replace(':', '.')}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Navigation */}
          <nav aria-label="Bunnmeny">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6 italic">Snarveier</h2>
            <ul className="space-y-3 text-sm font-bold text-gray-600">
              <li><Link href="/book" className="hover:text-blue-600 transition-colors">Book bane</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Priser og medlemskap</Link></li>
              <li><Link href="/#kontakt" className="hover:text-blue-600 transition-colors">Finn oss</Link></li>
            </ul>
          </nav>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">© {new Date().getFullYear()} {site.legalName}</p>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Nettsiden er laget av Ib Strømsvåg og Lucas Hagfoss</p>
        </div>
      </div>
    </footer>
  )
}
