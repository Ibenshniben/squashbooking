import { Phone, Clock, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6 italic">Kontakt</h3>
            <div className="space-y-4">
              <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">Eyvind Strømsvåg</p>
              <a href="tel:+4791372666" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                <Phone className="h-4 w-4" />
                913 72 666
              </a>
              <div className="flex items-start gap-2 text-sm text-gray-500 font-medium">
                <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                <span>Haumyveien 39c,<br />4638 Kristiansand</span>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6 italic">Åpningstider</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Hverdager</span>
                <span className="text-sm font-black text-gray-900">07.00 - 23.00</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Lørdag - Søndag</span>
                <span className="text-sm font-black text-gray-900">09.00 - 22.00</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">© {new Date().getFullYear()} Søm Squashklubb</p>
          <div className="flex gap-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic underline decoration-blue-600/30">Nettsiden er laget av Ib Strømsvåg og Lucas Hagfoss</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
