import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Auth form */}
      <div className="flex flex-col justify-between px-6 py-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Elevate Estate</span>
        </Link>

        <div className="mx-auto w-full max-w-sm">{children}</div>

        <p className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} Elevate Estate. All rights reserved.
        </p>
      </div>

      {/* Right: Imagery */}
      <div className="relative hidden lg:block bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background/60 z-10" />
        <div className="absolute inset-0 flex flex-col justify-end p-12 z-20">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium text-foreground/90 leading-relaxed text-balance">
              &ldquo;The most intuitive listing platform we&apos;ve used. Our team closed
              40% more deals in the first quarter.&rdquo;
            </p>
            <footer className="text-sm text-muted-foreground">
              Sarah Chen · Principal Broker, Pacific Realty Group
            </footer>
          </blockquote>
        </div>
        {/* Abstract property pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent/20 blur-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-sidebar/40 blur-3xl" />
        </div>
      </div>
    </div>
  )
}
