import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default:  'Easy Drive — Car Rentals for GTA Gig Drivers',
    template: '%s | Easy Drive',
  },
  description: 'Weekly car rentals for Uber Eats, DoorDash, and SkipTheDishes drivers in the Greater Toronto Area. No hard credit check. From $300/week.',
  keywords:    ['car rental', 'gig drivers', 'Uber Eats', 'DoorDash', 'GTA', 'Toronto', 'no credit check'],
  openGraph: {
    title:       'Easy Drive — Car Rentals for GTA Gig Drivers',
    description: 'Weekly rentals from $300/week. No hard credit check. Unlimited mileage.',
    type:        'website',
    locale:      'en_CA',
  },
  robots: {
    index:  true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
