'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  Calendar,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'
import type { ListingDetail } from '@/lib/types'

function listingStatus(l: ListingDetail): string {
  const map: Record<string, string> = {
    for_sale: 'For Sale',
    for_rent: 'For Rent',
    sold: 'Sold',
    off_market: 'Off Market',
  }
  return map[l.listing_type] ?? l.listing_type
}

export default function PublicPropertyPage() {
  const { slug } = useParams<{ slug: string }>()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [sending, setSending] = useState(false)
  const [inquiry, setInquiry] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)

  useEffect(() => {
    api
      .get<ListingDetail>(`/listings/${slug}`)
      .then((data) => setListing(data))
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.includes('404')) {
          setNotFound(true)
        }
      })
      .finally(() => setIsLoading(false))
  }, [slug])

  async function handleInquiry(e: React.FormEvent) {
    e.preventDefault()
    if (!inquiry.email.includes('@') || !inquiry.firstName) {
      toast.error('Please fill in your name and email')
      return
    }
    setSending(true)
    await new Promise((r) => setTimeout(r, 800))
    setSending(false)
    setSent(true)
    toast.success("Message sent! We'll be in touch soon.")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <MapPin className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-semibold">Property not found</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          This listing may have been removed or the URL is incorrect.
        </p>
      </div>
    )
  }

  const address = listing.address
    ? [listing.address.street_1, listing.address.street_2].filter(Boolean).join(', ')
    : listing.title
  const cityLine = listing.address
    ? `${listing.address.city}, ${listing.address.state} ${listing.address.postal_code}`
    : ''
  const price = listing.asking_price ? parseFloat(listing.asking_price) : null

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
          <div className="grid grid-cols-4 gap-2 py-4 h-[400px]">
            <div className="col-span-3 rounded-xl overflow-hidden relative bg-gradient-to-br from-muted to-muted/40 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/60 to-muted/20" />
              <div className="absolute bottom-4 right-4 flex gap-1">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 bg-black/40 hover:bg-black/60 text-white border-0 backdrop-blur-sm"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 bg-black/40 hover:bg-black/60 text-white border-0 backdrop-blur-sm"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="grid grid-rows-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
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
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold tracking-tight">{address}</h1>
                  {cityLine && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{cityLine}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {price && (
                    <p className="text-3xl font-bold tracking-tight">{formatCurrency(price)}</p>
                  )}
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 mt-1"
                  >
                    {listingStatus(listing)}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 py-4 border-y border-border/60">
                {[
                  listing.bedrooms !== null && {
                    icon: Bed,
                    label: 'Bedrooms',
                    value: listing.bedrooms,
                  },
                  listing.bathrooms && { icon: Bath, label: 'Bathrooms', value: listing.bathrooms },
                  listing.square_feet !== null && {
                    icon: Ruler,
                    label: 'Square feet',
                    value: listing.square_feet?.toLocaleString(),
                  },
                  listing.year_built && {
                    icon: Calendar,
                    label: 'Year built',
                    value: listing.year_built,
                  },
                ]
                  .filter(Boolean)
                  .map((fact) => {
                    if (!fact) return null
                    const f = fact as {
                      icon: React.ComponentType<{ className?: string }>
                      label: string
                      value: string | number | null
                    }
                    const Icon = f.icon
                    return (
                      <div key={f.label} className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">{f.label}</p>
                          <p className="text-sm font-semibold">{f.value}</p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {listing.description && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">About this home</h2>
                {listing.description.split('\n\n').map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-foreground/80">
                    {para}
                  </p>
                ))}
              </div>
            )}

            {listing.address && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Location</h2>
                <div className="h-64 rounded-xl bg-muted/40 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">{address}</p>
                    <p className="text-xs mt-1">{cityLine}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: sticky inquiry card */}
          <div className="lg:sticky lg:top-20 self-start">
            <Card className="border-border/60 shadow-lg">
              <CardContent className="p-5 space-y-4">
                {price && (
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{formatCurrency(price)}</p>
                    <p className="text-sm text-muted-foreground">
                      {[
                        listing.bedrooms && `${listing.bedrooms}bd`,
                        listing.bathrooms && `${listing.bathrooms}ba`,
                        listing.square_feet && `${listing.square_feet.toLocaleString()} sqft`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    EE
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Elevate Estate Agent</p>
                    <p className="text-xs text-muted-foreground">Licensed Real Estate Agent</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <a
                    href="tel:+12125550100"
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    +1 (212) 555-0100
                  </a>
                  <a
                    href="mailto:info@elevate.estate"
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    info@elevate.estate
                  </a>
                </div>

                <Separator />

                {sent ? (
                  <div className="py-4 text-center space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-primary mx-auto" />
                    <p className="text-sm font-medium">Message sent!</p>
                    <p className="text-xs text-muted-foreground">We&apos;ll be in touch shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleInquiry} className="space-y-3">
                    <p className="text-sm font-semibold">Send a message</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="fname" className="text-xs">
                          First name
                        </Label>
                        <Input
                          id="fname"
                          className="h-8 text-xs"
                          placeholder="Alex"
                          value={inquiry.firstName}
                          onChange={(e) =>
                            setInquiry((p) => ({ ...p, firstName: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lname" className="text-xs">
                          Last name
                        </Label>
                        <Input
                          id="lname"
                          className="h-8 text-xs"
                          placeholder="Johnson"
                          value={inquiry.lastName}
                          onChange={(e) =>
                            setInquiry((p) => ({ ...p, lastName: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="inquiry-email" className="text-xs">
                        Email
                      </Label>
                      <Input
                        id="inquiry-email"
                        type="email"
                        className="h-8 text-xs"
                        placeholder="you@email.com"
                        value={inquiry.email}
                        onChange={(e) => setInquiry((p) => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="inquiry-phone" className="text-xs">
                        Phone (optional)
                      </Label>
                      <Input
                        id="inquiry-phone"
                        type="tel"
                        className="h-8 text-xs"
                        placeholder="+1 (555) 000-0000"
                        value={inquiry.phone}
                        onChange={(e) => setInquiry((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="message" className="text-xs">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        className="text-xs min-h-16 resize-none"
                        value={
                          inquiry.message ||
                          `Hi, I'm interested in ${address}. Please contact me.`
                        }
                        onChange={(e) => setInquiry((p) => ({ ...p, message: e.target.value }))}
                      />
                    </div>
                    <Button className="w-full" size="sm" disabled={sending}>
                      {sending ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        'Request information'
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="border-t border-border/60 mt-16 py-8 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-xs text-muted-foreground">
          <p>
            Listing presented by Elevate Estate · All information deemed reliable but not
            guaranteed.
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Elevate Estate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
