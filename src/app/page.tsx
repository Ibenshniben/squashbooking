import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { ChevronRight, Clock, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            <img src="/img.png" alt="" width={165} height={133} className="h-36 md:h-44 w-auto object-contain mb-10 animate-pop" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tight text-balance mb-6">
              Squash på Søm i {site.city}
            </h1>
            <p className="max-w-xl text-base md:text-lg font-medium text-gray-600 text-pretty mb-12">
              Se ledige tider og book bane på nett hos {site.legalName}.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <Link 
                href="/book" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors duration-300 shadow-2xl shadow-black/10 active:scale-95"
              >
                Book Bane Nå
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link 
                href="/pricing" 
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-gray-900 px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-gray-200 hover:border-gray-900 transition-colors"
              >
                Se Priser & Avtaler
              </Link>
            </div>
          </div>
        </section>

        {/* Kontakt Oss Section */}
        <section id="kontakt" className="py-20 md:py-24 bg-white scroll-mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div className="order-2 md:order-1 bg-white p-3 rounded-[2rem] md:rounded-[3rem] border border-gray-200 shadow-2xl shadow-black/5">
                <div className="bg-gray-100 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden h-[320px] md:h-[400px]">
                  <iframe 
                    src={`https://maps.google.com/maps?q=${site.geo.lat},${site.geo.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Kart til ${site.legalName}`}
                  ></iframe>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 uppercase italic tracking-tighter mb-10">Kontakt Oss</h2>
                <div className="space-y-10">
                  <div className="flex items-start gap-6">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <MapPin className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Lokasjon</h3>
                      <p className="text-xl font-black text-gray-900 uppercase tracking-tight leading-tight">{site.legalName}</p>
                      <p className="text-lg font-bold text-gray-600 mt-1">{site.street}</p>
                      <p className="text-lg font-bold text-gray-600">{site.postalCode} {site.city}</p>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${site.geo.lat},${site.geo.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
                      >
                        Få veibeskrivelse
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <Phone className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Ring Oss</h3>
                      <a href={`tel:${site.phone}`} className="text-2xl font-black text-gray-900 tabular-nums hover:text-blue-600 transition-colors tracking-tight">{site.phoneDisplay}</a>
                      <p className="text-sm font-bold text-gray-600 mt-1">{site.contactName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <Clock className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Åpningstider</h3>
                      <dl className="space-y-1">
                        {site.hours.map((h) => (
                          <div key={h.label} className="flex gap-4 text-lg">
                            <dt className="font-bold text-gray-600 min-w-[9.5rem]">{h.label}</dt>
                            <dd className="font-black text-gray-900 tabular-nums">{h.opens.replace(':', '.')} - {h.closes.replace(':', '.')}</dd>
                          </div>
                        ))}
                      </dl>
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
