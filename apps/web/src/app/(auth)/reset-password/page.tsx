import type { Metadata } from 'next'
import Link from 'next/link'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = { title: 'Reset Password' }

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>

      <ResetPasswordForm />

      <p className="text-sm text-center text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground hover:underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
