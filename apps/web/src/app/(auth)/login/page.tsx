import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your Elevate Estate workspace
        </p>
      </div>

      <LoginForm />

      <p className="text-sm text-center text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-primary hover:underline underline-offset-4">
          Create one free
        </Link>
      </p>
    </div>
  )
}
