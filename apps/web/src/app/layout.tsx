import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Elevate Estate',
    template: '%s · Elevate Estate',
  },
  description:
    'Premium real estate CRM — listing-centered, AI-enhanced, built for modern brokerages.',
  keywords: ['real estate', 'CRM', 'listings', 'property management', 'brokerage'],
  authors: [{ name: 'Elevate Estate' }],
  openGraph: {
    type: 'website',
    title: 'Elevate Estate CRM',
    description: 'Premium real estate CRM for modern brokerages.',
    siteName: 'Elevate Estate',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elevate Estate CRM',
    description: 'Premium real estate CRM for modern brokerages.',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
