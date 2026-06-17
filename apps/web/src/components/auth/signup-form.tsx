'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

type Errors = {
  full_name?: string
  email?: string
  password?: string
  confirmPassword?: string
  org_name?: string
  org_slug?: string
}

export function SignupForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    org_name: '',
    org_slug: '',
  })
  const [errors, setErrors] = useState<Errors>({})

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setForm((p) => {
        const next = { ...p, [key]: value }
        if (key === 'org_name') {
          next.org_slug = value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 100)
        }
        return next
      })
      setErrors((p) => ({ ...p, [key]: undefined }))
    }
  }

  function validate(): Errors {
    const e: Errors = {}
    if (form.full_name.length < 2) e.full_name = 'Name must be at least 2 characters'
    if (!form.email.includes('@')) e.email = 'Enter a valid email'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    else if (!/[A-Z]/.test(form.password)) e.password = 'Must contain an uppercase letter'
    else if (!/[0-9]/.test(form.password)) e.password = 'Must contain a number'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (form.org_name.length < 2) e.org_name = 'Organization name is required'
    if (form.org_slug.length < 2) e.org_slug = 'URL slug must be at least 2 characters'
    else if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(form.org_slug))
      e.org_slug = 'Only lowercase letters, numbers, and hyphens'
    return e
  }

  async function onSubmit(evt: React.FormEvent) {
    evt.preventDefault()
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    setIsSubmitting(true)
    try {
      await api.post('/auth/signup', {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        org_name: form.org_name,
        org_slug: form.org_slug,
      })
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
        <Label htmlFor="full_name">Full name</Label>
        <Input
          id="full_name"
          type="text"
          placeholder="Alex Johnson"
          autoComplete="name"
          value={form.full_name}
          onChange={set('full_name')}
        />
        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          type="email"
          placeholder="alex@brokerage.com"
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
        />
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
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="border-t border-border/60 pt-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Organization
        </p>

        <div className="space-y-2">
          <Label htmlFor="org_name">Brokerage name</Label>
          <Input
            id="org_name"
            type="text"
            placeholder="Elevate Realty Group"
            value={form.org_name}
            onChange={set('org_name')}
          />
          {errors.org_name && <p className="text-xs text-destructive">{errors.org_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="org_slug">URL slug</Label>
          <div className="flex items-center gap-0">
            <span className="flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground select-none">
              elevate.estate/
            </span>
            <Input
              id="org_slug"
              type="text"
              placeholder="elevate-realty"
              value={form.org_slug}
              onChange={set('org_slug')}
              className="rounded-l-none"
            />
          </div>
          {errors.org_slug && <p className="text-xs text-destructive">{errors.org_slug}</p>}
        </div>
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
        <a href="/terms" className="underline hover:text-foreground">
          Terms
        </a>{' '}
        and{' '}
        <a href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </a>
      </p>
    </form>
  )
}
