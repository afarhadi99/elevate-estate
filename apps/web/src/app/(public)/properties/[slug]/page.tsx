import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MapPin, Bed, Bath, Ruler, Calendar, Phone, Mail, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'

// Mock data — in production, fetched from API by slug
const MOCK_PROPERTY = {
  slug: '142-riverside-drive',
  address: '142 Riverside Drive',
  city: 'New York',
  state: 'NY',
  zip: '10024',
  neighborhood: 'Upper West Side',
  price: 2850000,
  beds: 4,
  baths: 3,
  halfBaths: 1,
  sqft: 2400,
  type: 'Condo',
  yearBuilt: 1998,
  status: 'Active',
  description: `Stunning 4-bedroom, 3.5-bath pre-war condo on the prestigious Upper West Side. This light-filled home features soaring 10-foot ceilings, original hardwood floors, and breathtaking Hudson River views.

The chef's kitchen boasts custom cabinetry, marble countertops, and top-of-the-line appliances. The generous primary suite includes a spa-inspired bathroom and two walk-in closets. Additional bedrooms are well-proportioned with excellent closet space.

Located just steps from Riverside Park, top-rated schools, and the best dining the Upper West Side has to offer. Building amenities include a 24-hour doorman, state-of-the-art fitness center, and a private residents' courtyard.`,
  features: [
    'Hudson River views',
    'Pre-war details',
    '10-foot ceilings',
    'Chef\'s kitchen',
    'Primary suite with walk-in closets',
    'Private outdoor terrace',
    '24-hour doorman',
    'Fitness center',
    'Pet-friendly building',
    'Bike storage',
    'Package room',
    'Steps from Riverside Park',
  ],
  agent: {
    name: 'Sarah Chen',
    title: 'Senior Agent, Elevate Estate',
    phone: '+1 (212) 555-0192',
    email: 'sarah@elevate.estate',
    initials: 'SC',
  },
  images: Array.from({ length: 12 }, (_, i) => ({
    id: `img-${i}`,
    alt: `Property photo ${i + 1}`,
    url: null,
  })),
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const property = MOCK_PROPERTY
  if (!property) return { title: 'Property Not Found' }

  return {
    title: `${property.address} · ${formatCurrency(property.price)}`,
    description: property.description.slice(0, 155),
    openGraph: {
      title: `${property.address} — ${formatCurrency(property.price)}`,
      description: `${property.beds}bd/${property.baths}ba · ${property.sqft.toLocaleString()} sqft · ${property.neighborhood}, ${property.city}`,
      type: 'website',
    },
  }
}

export default async function PublicPropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const property = MOCK_PROPERTY
  if (!property) notFound()

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-xs font-bold text-primary-foreground">EE</span>
            </div>
            <span className="text-sm font-semibold">Elevate Estate</span>
          </div>
          <Button size="sm" className="h-8 text-xs">
            Schedule a showing
          </Button>
        </div>
      </nav>

      {/* Hero gallery */}
      <div className="relative bg-muted overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-4 gap-2 py-4 h-[480px]">
            {/* Main large photo */}
            <div className="col-span-3 rounded-xl overflow-hidden relative bg-gradient-to-br from-muted to-muted/40 group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/60 to-muted/20" />
              <div className="absolute bottom-4 left-4">
                <Badge className="bg-black/60 text-white border-0 text-xs backdrop-blur-sm">
                  1 / {property.images.length}
                </Badge>
              </div>
              <div className="absolute bottom-4 right-4 flex gap-1">
                <Button size="icon" variant="secondary" className="h-7 w-7 bg-black/40 hover:bg-black/60 text-white border-0 backdrop-blur-sm">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="secondary" className="h-7 w-7 bg-black/40 hover:bg-black/60 text-white border-0 backdrop-blur-sm">
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {/* Thumbnail grid */}
            <div className="grid grid-rows-3 gap-2">
              {property.images.slice(1, 4).map((img, i) => (
                <div
                  key={img.id}
                  className="rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/30 cursor-pointer hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold tracking-tight">{property.address}</h1>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {property.neighborhood}, {property.city}, {property.state} {property.zip}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold tracking-tight">
                    {formatCurrency(property.price)}
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 mt-1"
                  >
                    {property.status}
                  </Badge>
                </div>
              </div>

              {/* Key facts */}
              <div className="flex flex-wrap gap-6 py-4 border-y border-border/60">
                {[
                  { icon: Bed, label: 'Bedrooms', value: property.beds },
                  { icon: Bath, label: 'Bathrooms', value: `${property.baths} full · ${property.halfBaths} half` },
                  { icon: Ruler, label: 'Square feet', value: property.sqft.toLocaleString() },
                  { icon: Calendar, label: 'Year built', value: property.yearBuilt },
                ].map((fact) => {
                  const Icon = fact.icon
                  return (
                    <div key={fact.label} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{fact.label}</p>
                        <p className="text-sm font-semibold">{fact.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">About this home</h2>
              {property.description.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground/80">
                  {para}
                </p>
              ))}
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Features & Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
                {property.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Location</h2>
              <div className="h-64 rounded-xl bg-muted/40 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{property.address}</p>
                  <p className="text-xs mt-1">
                    {property.neighborhood}, {property.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: sticky inquiry card */}
          <div className="lg:sticky lg:top-20 self-start">
            <Card className="border-border/60 shadow-lg">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{formatCurrency(property.price)}</p>
                  <p className="text-sm text-muted-foreground">
                    {property.beds}bd · {property.baths}ba · {property.sqft.toLocaleString()} sqft
                  </p>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {property.agent.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{property.agent.name}</p>
                    <p className="text-xs text-muted-foreground">{property.agent.title}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {property.agent.phone}
                  </a>
                  <a
                    href={`mailto:${property.agent.email}`}
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {property.agent.email}
                  </a>
                </div>

                <Separator />

                <form className="space-y-3">
                  <p className="text-sm font-semibold">Send a message</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="fname" className="text-xs">First name</Label>
                      <Input id="fname" className="h-8 text-xs" placeholder="Alex" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lname" className="text-xs">Last name</Label>
                      <Input id="lname" className="h-8 text-xs" placeholder="Johnson" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="inquiry-email" className="text-xs">Email</Label>
                    <Input id="inquiry-email" type="email" className="h-8 text-xs" placeholder="you@email.com" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="inquiry-phone" className="text-xs">Phone (optional)</Label>
                    <Input id="inquiry-phone" type="tel" className="h-8 text-xs" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="message" className="text-xs">Message</Label>
                    <Textarea
                      id="message"
                      className="text-xs min-h-16 resize-none"
                      defaultValue={`Hi, I'm interested in ${property.address}. Please contact me.`}
                    />
                  </div>
                  <Button className="w-full" size="sm">
                    Request information
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 mt-16 py-8 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-xs text-muted-foreground">
          <p>Listing presented by Elevate Estate · All information deemed reliable but not guaranteed.</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Elevate Estate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
