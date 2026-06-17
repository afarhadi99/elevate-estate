'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

type Errors = { name?: string; email?: string; password?: string; confirmPassword?: string }

export function SignupForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Errors>({})

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }))
      setErrors((p) => ({ ...p, [key]: undefined }))
    }
  }

  function validate(): Errors {
    const e: Errors = {}
    if (form.name.length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email.includes('@')) e.email = 'Enter a valid email'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    else if (!/[A-Z]/.test(form.password)) e.password = 'Must contain an uppercase letter'
    else if (!/[0-9]/.test(form.password)) e.password = 'Must contain a number'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  async function onSubmit(evt: React.FormEvent) {
    evt.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setIsSubmitting(true)
    try {
      await api.post('/auth/signup', { name: form.name, email: form.email, password: form.password })
      router.push('/verify-email')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not create account'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" type="text" placeholder="Alex Johnson" autoComplete="name" value={form.name} onChange={set('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input id="email" type="email" placeholder="alex@brokerage.com" autoComplete="email" value={form.email} onChange={set('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={set('confirmPassword')}
        />
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account…
          </>
        ) : (
          'Create account'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By signing up you agree to our{' '}
        <a href="/terms" className="underline hover:text-foreground">Terms</a>{' '}
        and <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
      </p>
    </form>
  )
}
