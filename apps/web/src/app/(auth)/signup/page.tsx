import type { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = { title: 'Create Account' }

export default function SignupPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Create your workspace</h1>
        <p className="text-sm text-muted-foreground">
          Set up your brokerage on Elevate Estate in minutes
        </p>
      </div>

      <SignupForm />

      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  )
}
