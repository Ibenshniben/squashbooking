import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} – Book squashbane i ${site.city}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: ["squash", "squash Kristiansand", "Søm squash", "book squashbane", "squashklubb", "squashbane Søm"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: "/",
    siteName: site.name,
    title: `${site.name} – Book squashbane i ${site.city}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} – Book squashbane i ${site.city}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: true, address: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "@id": `${site.url}/#klubb`,
  name: site.legalName,
  alternateName: site.name,
  description: site.description,
  url: site.url,
  image: `${site.url}/img.png`,
  logo: `${site.url}/img.png`,
  telephone: site.phone,
  sport: "Squash",
  address: {
    "@type": "PostalAddress",
    streetAddress: site.street,
    postalCode: site.postalCode,
    addressLocality: site.city,
    addressCountry: "NO",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: site.geo.lat,
    longitude: site.geo.lng,
  },
  openingHoursSpecification: site.hours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days,
    opens: h.opens,
    closes: h.closes,
  })),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-white`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <SessionProvider>
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
