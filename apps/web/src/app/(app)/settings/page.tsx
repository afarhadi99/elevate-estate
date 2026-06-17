'use client'

import { useEffect, useState } from 'react'
import { Building2, Palette, Shield, Globe, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ThemePicker } from '@/components/settings/theme-picker'
import { api } from '@/lib/api'
import type { OrgResponse } from '@/lib/types'

export default function SettingsPage() {
  const [org, setOrg] = useState<OrgResponse | null>(null)
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .get<OrgResponse>('/organizations/current')
      .then((data) => {
        setOrg(data)
        setName(data.name)
        setWebsite(data.website ?? '')
        setPhone(data.phone ?? '')
      })
      .catch(() => toast.error('Could not load organization settings'))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Organization name is required')
      return
    }
    setIsSaving(true)
    try {
      const updated = await api.patch<OrgResponse>('/organizations/current', {
        name: name.trim(),
        website: website.trim() || null,
        phone: phone.trim() || null,
      })
      setOrg(updated)
      toast.success('Settings saved')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      {/* Organization */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Organization</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Your brokerage&apos;s public and internal identity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-9 rounded-md bg-muted" />
              <div className="h-9 rounded-md bg-muted" />
              <div className="h-9 rounded-md bg-muted" />
              <div className="h-8 w-24 rounded-md bg-muted" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization name</Label>
                <Input
                  id="org-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {org && (
                <div className="space-y-2">
                  <Label htmlFor="org-slug">URL slug</Label>
                  <div className="flex items-center gap-0">
                    <span className="flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground select-none">
                      elevate.estate/
                    </span>
                    <Input
                      id="org-slug"
                      value={org.slug}
                      readOnly
                      className="rounded-l-none bg-muted/30 text-muted-foreground"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Slug cannot be changed after creation.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="org-website">Website</Label>
                <Input
                  id="org-website"
                  placeholder="https://yourbrokerage.com"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-phone">Phone</Label>
                <Input
                  id="org-phone"
                  placeholder="+1 (212) 555-0100"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button size="sm" type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Appearance</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Choose a theme palette for your workspace and public property pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemePicker />
        </CardContent>
      </Card>

      {/* Access */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Access & Signups</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Control who can join your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Open signups</Label>
              <p className="text-xs text-muted-foreground">
                Allow anyone to create an account and join this organization.
              </p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Invite-only mode</Label>
              <p className="text-xs text-muted-foreground">
                Only members you invite by email can join.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Public pages */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Public Pages</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Settings for your organization&apos;s public property showcase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Enable public showcase</Label>
              <p className="text-xs text-muted-foreground">
                Allow your property pages to be publicly viewable.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Show inquiry form</Label>
              <p className="text-xs text-muted-foreground">
                Display a contact form on public property pages.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
