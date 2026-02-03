import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { MapPin, Clock, Trophy, Calendar, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main>
        {/* Hero Section - Premium Dark Theme */}
        <div className="relative bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-950 z-0" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl opacity-50" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48 text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-900/50 border border-blue-700 text-blue-300 text-sm font-semibold mb-6 backdrop-blur-sm">
              Sørlandets beste squash-opplevelse
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white">
              Søm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Squash</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Moderne fasiliteter, enkelt bookingsystem og et inkluderende miljø for alle nivåer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/book" 
                className="group bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-900/20 flex items-center"
              >
                Book Bane Nå
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#info" 
                className="px-8 py-4 rounded-full font-bold text-lg text-slate-300 hover:text-white transition-colors flex items-center"
              >
                Les mer om oss
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="info" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Hvorfor velge Søm Squash?</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="group bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Squashbaner</h3>
                <p className="text-slate-600 leading-relaxed">
                  3 baner med varme og lys.
                </p>
              </div>
              
              <div className="group bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Åpningstider</h3>
                <p className="text-slate-600 leading-relaxed">
                  Vi holder åpent fra 06:00 til 23:00 hver eneste dag, slik at du kan spille når det passer deg best.
                </p>
              </div>
              
              <div className="group bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-7 w-7 text-sky-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Booking</h3>
                <p className="text-slate-600 leading-relaxed">
                  Book baner på nettsiden
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-slate-900 py-24 text-white relative overflow-hidden">
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
           
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-blue-400 font-semibold tracking-wider uppercase text-sm">Lokasjon</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-8 mt-2">Finn frem til oss</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start space-x-6 p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                    <MapPin className="h-8 w-8 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Besøksadresse</h4>
                      <p className="text-slate-300 text-lg">Haumyrveien 39C</p>
                      <p className="text-slate-400">4637 Kristiansand</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-6 p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                    <div className="h-8 w-8 text-blue-400 mt-1 flex-shrink-0 flex items-center justify-center font-mono text-xs border border-blue-400 rounded-lg">
                      GPS
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Koordinater</h4>
                      <p className="text-slate-300 font-mono">58.1571° N, 8.0674° Ø</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10">
                   <a 
                    href="https://www.google.com/maps/search/?api=1&query=58.15712083108156,8.067453375729793" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-slate-900 bg-white hover:bg-slate-100 transition-colors"
                   >
                     Åpne veibeskrivelse i Google Maps
                     <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
                   </a>
                </div>
              </div>
              
              <div className="relative h-[450px] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-800">
                <iframe 
                  src="https://maps.google.com/maps?q=58.15712083108156,8.067453375729793&z=15&output=embed"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Kart til Søm Squash"
                  className="filter grayscale hover:grayscale-0 transition-all duration-700 opacity-90 hover:opacity-100"
                ></iframe>
                
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-lg transform translate-y-full transition-transform duration-300 hover:translate-y-0 opacity-0 hover:opacity-100">
                    <p className="text-sm text-slate-300 text-center">Klikk på kartet for å interagere</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
