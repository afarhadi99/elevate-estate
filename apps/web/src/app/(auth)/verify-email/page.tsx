import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Verify Email' }

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6 text-center animate-fade-in">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Mail className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Check your inbox</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a verification link to your email address. Click it to activate your account.
        </p>
      </div>
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <button className="text-primary hover:underline underline-offset-4">
            resend the email
          </button>
        </p>
        <Link
          href="/login"
          className="flex h-9 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
