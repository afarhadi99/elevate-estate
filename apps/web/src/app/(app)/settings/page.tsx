import type { Metadata } from 'next'
import { Building2, Palette, Bell, Shield, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ThemePicker } from '@/components/settings/theme-picker'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization name</Label>
            <Input id="org-name" defaultValue="Elevate Estate Co." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-slug">URL slug</Label>
            <div className="flex items-center gap-0">
              <span className="flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                elevate.estate/
              </span>
              <Input
                id="org-slug"
                defaultValue="elevate-co"
                className="rounded-l-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-website">Website</Label>
            <Input id="org-website" placeholder="https://yourbrokerage.com" type="url" />
          </div>
          <Button size="sm">Save changes</Button>
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
