import type { Metadata } from 'next'
import { Plug, CheckCircle2, AlertCircle, Clock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = { title: 'Integrations' }

const integrations = [
  {
    id: 'google-maps',
    name: 'Google Maps',
    description: 'Geocoding, property maps, Places autocomplete, and marker clustering.',
    category: 'Maps',
    status: 'connected',
    logo: '🗺️',
    lastSync: null,
  },
  {
    id: 'bridge-mls',
    name: 'Bridge / RESO MLS',
    description: 'Import licensed MLS listings normalized to RESO Data Dictionary standard.',
    category: 'MLS Data',
    status: 'not-connected',
    logo: '🏘️',
    lastSync: null,
    note: 'MLS access requires a licensing agreement with your regional MLS provider.',
  },
  {
    id: 'zillow',
    name: 'Zillow Bridge',
    description: 'Enrich listings with Zestimates and public Zillow data where permitted.',
    category: 'Market Data',
    status: 'not-connected',
    logo: 'Z',
    lastSync: null,
    note: 'Subject to Bridge API terms. Local storage restrictions apply.',
  },
  {
    id: 'idx-broker',
    name: 'IDX Broker',
    description: 'Sync leads and display IDX-approved listing subsets.',
    category: 'IDX',
    status: 'not-connected',
    logo: '🔗',
    lastSync: null,
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini / Imagen',
    description: 'AI description generation and photo enhancement powered by Gemini & Imagen (Nano Banana).',
    category: 'AI',
    status: 'connected',
    logo: '✨',
    lastSync: null,
  },
  {
    id: 'smtp',
    name: 'Email (SMTP)',
    description: 'Send invitation emails, notifications, and listing alerts.',
    category: 'Email',
    status: 'connected',
    logo: '📧',
    lastSync: null,
  },
]

const statusConfig = {
  connected: { label: 'Connected', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  'not-connected': { label: 'Not connected', icon: Plug, color: 'text-muted-foreground', badgeClass: 'bg-muted text-muted-foreground' },
  error: { label: 'Error', icon: AlertCircle, color: 'text-destructive', badgeClass: 'bg-destructive/10 text-destructive' },
  syncing: { label: 'Syncing', icon: Clock, color: 'text-amber-600', badgeClass: 'bg-amber-500/15 text-amber-700' },
}

export default function IntegrationsPage() {
  const categories = [...new Set(integrations.map((i) => i.category))]

  return (
    <div className="space-y-8 animate-fade-in">
      <p className="text-sm text-muted-foreground">
        Connect external providers. Each integration maps data into your canonical listing schema.
      </p>

      {categories.map((category) => {
        const items = integrations.filter((i) => i.category === category)
        return (
          <div key={category} className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {category}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((integration) => {
                const config = statusConfig[integration.status as keyof typeof statusConfig]
                const StatusIcon = config.icon
                return (
                  <Card key={integration.id} className="border-border/60 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xl">
                          {integration.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">{integration.name}</span>
                            <Badge
                              variant="secondary"
                              className={`text-xs border-0 shrink-0 flex items-center gap-1 ${config.badgeClass}`}
                            >
                              <StatusIcon className="h-2.5 w-2.5" />
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {integration.description}
                          </p>
                          {integration.note && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-start gap-1">
                              <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                              {integration.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex gap-2">
                        {integration.status === 'connected' ? (
                          <>
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              Configure
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-destructive hover:text-destructive"
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" className="h-7 text-xs gap-1">
                            <Plug className="h-3 w-3" />
                            Connect
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 ml-auto">
                          <ExternalLink className="h-3 w-3" />
                          Docs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
