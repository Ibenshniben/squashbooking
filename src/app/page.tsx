import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Clock, MapPin, Phone, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="relative py-24 md:py-32 overflow-hidden border-b border-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter uppercase italic text-gray-900 leading-tight">
              Velkommen til <br /> <span className="text-blue-600">Søm Squashklubb</span>
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/book" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all duration-300 shadow-2xl shadow-black/10 active:scale-95"
              >
                Book Bane Nå
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/pricing" 
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-gray-900 px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-gray-100 hover:border-gray-200 transition-all"
              >
                Se Priser & Avtaler
              </Link>
            </div>
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-[0.02]">
            <div className="grid grid-cols-3 gap-4 h-full">
              <div className="bg-gray-900 rounded-full blur-3xl w-[500px] h-[500px]"></div>
              <div className="bg-blue-600 rounded-full blur-3xl w-[500px] h-[500px] mt-48"></div>
              <div className="bg-gray-900 rounded-full blur-3xl w-[500px] h-[500px]"></div>
            </div>
          </div>
        </div>

        {/* Kontakt Oss Section */}
        <section id="kontakt" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div className="order-2 md:order-1 relative group">
                <div className="absolute inset-0 bg-blue-600 rounded-[3rem] rotate-3 opacity-[0.03] group-hover:rotate-2 transition-transform" />
                <div className="relative bg-white p-3 rounded-[3rem] border border-gray-200 shadow-2xl shadow-black/5 overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-[2.5rem] overflow-hidden h-[400px]">
                    <iframe 
                      src="https://maps.google.com/maps?q=58.157193154361394,8.067433141273241&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Kart til Søm Squashklubb"
                    ></iframe>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <h2 className="text-5xl font-black text-gray-900 uppercase italic tracking-tighter mb-8">Kontakt Oss</h2>
                <div className="space-y-10">
                  <div className="flex items-start gap-6">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Lokasjon</p>
                      <p className="text-xl font-black text-gray-900 uppercase tracking-tighter leading-tight">Søm Squashklubb</p>
                      <p className="text-lg font-bold text-gray-500 mt-1">Haumyveien 39c</p>
                      <p className="text-lg font-bold text-gray-500 tracking-tight">4638 Kristiansand</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Ring Oss</p>
                      <a href="tel:+4791372666" className="text-2xl font-black text-gray-900 tabular-nums hover:text-blue-600 transition-colors tracking-tighter">913 72 666</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
