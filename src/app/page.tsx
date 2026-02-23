import { Header } from "@/components/layout/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="bg-blue-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Velkommen til Søm Squash</h1>
            <p className="text-xl mb-8">Vi har 3 moderne baner klare for deg.</p>
            <Link 
              href="/book" 
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition duration-300"
            >
              Book Bane Nå
            </Link>
          </div>
        </div>

        {/* Info Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Om Oss</h2>
              <p className="text-gray-600 mb-4">
                Søm Squash tilbyr flotte treningsfasiliteter for både nybegynnere og erfarne spillere.
                Våre 3 baner holder høy standard og er tilgjengelige for booking hele uken.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>3 profesjonelle baner</li>
                <li>Garderober med dusj</li>
                <li>Utleie av utstyr</li>
                <li>Åpent 06:00 - 23:00 hver dag</li>
              </ul>
            </div>
            
            {/* Map Section */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Finn Oss</h2>
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden h-[300px]">
                {/* Replace src with actual Google Maps Embed URL for Søm Squash */}
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2106.632049878275!2d8.064564377341893!3d58.16364297402663!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4647bd636502287d%3A0x6b34563456345634!2sS%C3%B8m%20Squash!5e0!3m2!1sen!2sno!4v1625645645645!5m2!1sen!2sno" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Kart til Søm Squash"
                ></iframe>
              </div>
              <p className="mt-4 text-gray-600">
                Adresse: Vardåsveien 69, 4638 Kristiansand
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
