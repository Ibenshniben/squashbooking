const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  process.env.NEXTAUTH_URL ||
  'http://localhost:3000'

export const site = {
  url: rawUrl.replace(/\/$/, ''),
  name: 'Søm Squash',
  legalName: 'Søm Squashklubb',
  description:
    'Book squashbane hos Søm Squashklubb i Kristiansand. Se ledige tider, priser og medlemskap, og reserver bane på nett.',
  contactName: 'Eyvind Strømsvåg',
  phone: '+4791372666',
  phoneDisplay: '913 72 666',
  street: 'Haumyveien 39c',
  postalCode: '4638',
  city: 'Kristiansand',
  geo: { lat: 58.157193154361394, lng: 8.067433141273241 },
  hours: [
    { label: 'Hverdager', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '07:00', closes: '23:00' },
    { label: 'Lørdag - Søndag', days: ['Saturday', 'Sunday'], opens: '09:00', closes: '22:00' },
  ],
}
