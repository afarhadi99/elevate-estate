import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  MapPin,
  Calendar,
  Eye,
  Sparkles,
  Camera,
  ExternalLink,
  ChevronRight,
  Home,
  Pencil,
  Globe,
  MoreHorizontal,
  Clock,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Listing Detail' }

// Mocked listing data — in production this comes from the API
const MOCK_LISTING = {
  id: '1',
  address: '142 Riverside Drive',
  unit: '',
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
  lotSize: null,
  stage: 'Photography',
  status: 'Active',
  isPublished: true,
  description: `Stunning 4-bedroom, 3.5-bath pre-war condo on the prestigious Upper West Side. This light-filled home features soaring 10-foot ceilings, original hardwood floors, and breathtaking Hudson River views. The chef's kitchen boasts custom cabinetry, marble countertops, and top-of-the-line appliances. The primary suite includes a spa-inspired bathroom and two walk-in closets. Building amenities include a 24-hour doorman, fitness center, and private courtyard.`,
  features: [
    'Hudson River views',
    'Pre-war details',
    '10-foot ceilings',
    'Chef\'s kitchen',
    'Primary suite with walk-in closets',
    'Private outdoor terrace',
    '24-hour doorman',
    'Fitness center',
    'Pet-friendly',
  ],
  agent: {
    name: 'Sarah Chen',
    initials: 'SC',
    title: 'Senior Agent',
  },
  createdAt: '2024-11-15T10:00:00Z',
  updatedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  coordinates: { lat: 40.7831, lng: -73.9712 },
  mediaCount: 12,
  notes: [
    {
      id: 'n1',
      author: 'Sarah Chen',
      initials: 'SC',
      content: 'Seller confirmed repairs are complete. Ready for professional photography session.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'n2',
      author: 'Marcus Lee',
      initials: 'ML',
      content: 'Contacted building management for elevator reservation during photo shoot.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ],
  stages: ['Prep', 'Photography', 'Active', 'Under Contract', 'Closed'],
  activity: [
    { id: 'a1', type: 'stage', text: 'Moved to Photography stage', time: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    { id: 'a2', type: 'note', text: 'Note added by Sarah Chen', time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 'a3', type: 'media', text: '12 photos uploaded', time: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: 'a4', type: 'publish', text: 'Public page published', time: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  ],
}

const STAGE_ORDER = ['Prep', 'Photography', 'Active', 'Under Contract', 'Closed']

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = MOCK_LISTING
  if (!listing) notFound()

  const currentStageIdx = STAGE_ORDER.indexOf(listing.stage)
  const fullAddress = [
    listing.address,
    listing.unit,
    `${listing.city}, ${listing.state} ${listing.zip}`,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Listings</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{listing.address}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-semibold tracking-tight">{listing.address}</h2>
            <Badge
              variant="secondary"
              className="bg-violet-500/15 text-violet-700 dark:text-violet-300 border-0"
            >
              {listing.stage}
            </Badge>
            {listing.isPublished && (
              <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0">
                <Globe className="mr-1 h-2.5 w-2.5" />
                Published
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{fullAddress}</span>
            {listing.neighborhood && (
              <>
                <span>·</span>
                <span>{listing.neighborhood}</span>
              </>
            )}
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(listing.price)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Preview page
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            AI tools
          </Button>
          <Button size="sm" className="h-9 gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stage progress */}
      <div className="flex items-center gap-0">
        {STAGE_ORDER.map((stage, idx) => {
          const isDone = idx < currentStageIdx
          const isCurrent = idx === currentStageIdx
          const isLast = idx === STAGE_ORDER.length - 1
          return (
            <div key={stage} className="flex items-center flex-1">
              <button
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all w-full ${
                  isCurrent
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : isDone
                    ? 'text-muted-foreground/60'
                    : 'text-muted-foreground/50'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary/60" />
                ) : (
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isCurrent ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                )}
                <span className={isCurrent ? '' : ''}>{stage}</span>
              </button>
              {!isLast && (
                <div
                  className={`h-px flex-1 mx-1 ${
                    isDone || isCurrent ? 'bg-primary/30' : 'bg-border/60'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 h-9 p-1 gap-0.5">
          <TabsTrigger value="overview" className="text-xs h-7 px-4">
            Overview
          </TabsTrigger>
          <TabsTrigger value="media" className="text-xs h-7 px-4">
            Media
            <Badge variant="secondary" className="ml-1.5 h-4 min-w-4 text-[10px] px-1">
              {listing.mediaCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs h-7 px-4">
            Notes
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs h-7 px-4">
            Activity
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs h-7 px-4">
            AI Tools
          </TabsTrigger>
          <TabsTrigger value="public" className="text-xs h-7 px-4">
            Public Page
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0 space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Property facts */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Property type', value: listing.type },
                      { label: 'Bedrooms', value: listing.beds },
                      { label: 'Bathrooms', value: `${listing.baths} full, ${listing.halfBaths} half` },
                      { label: 'Square feet', value: listing.sqft.toLocaleString() },
                      { label: 'Year built', value: listing.yearBuilt },
                      { label: 'Neighborhood', value: listing.neighborhood },
                    ].map((fact) => (
                      <div key={fact.label} className="space-y-0.5">
                        <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                        <dd className="text-sm font-medium">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Description</CardTitle>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      <Sparkles className="h-3 w-3" />
                      Regenerate with AI
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-foreground/80">{listing.description}</p>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Features & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {listing.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-sm text-foreground/80">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Map placeholder */}
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Location</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-48 bg-muted/40 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Map preview</p>
                      <p className="text-xs mt-1">{fullAddress}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right rail */}
            <div className="space-y-4">
              {/* Assigned agent */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Assigned to</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/15 text-primary text-sm font-semibold">
                        {listing.agent.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{listing.agent.name}</p>
                      <p className="text-xs text-muted-foreground">{listing.agent.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(listing.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Last updated</span>
                    <span>{formatDate(listing.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Publish checklist */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Publish Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: 'Address & details', done: true },
                    { label: 'Description', done: true },
                    { label: 'Photos (min. 5)', done: true },
                    { label: 'Price set', done: true },
                    { label: 'Agent assigned', done: true },
                    { label: 'Public page configured', done: listing.isPublished },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          item.done ? 'text-primary' : 'text-muted-foreground/30'
                        }`}
                      />
                      <span className={item.done ? 'text-foreground/80' : 'text-muted-foreground'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="mt-0">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Media Gallery ({listing.mediaCount} files)
                </CardTitle>
                <Button size="sm" className="h-8 gap-1.5">
                  <Camera className="h-3.5 w-3.5" />
                  Upload photos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {Array.from({ length: listing.mediaCount }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer overflow-hidden group relative"
                  >
                    <div className="h-full w-full bg-gradient-to-br from-muted/80 to-muted/30" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                    {i === 0 && (
                      <Badge className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0 h-4">
                        Cover
                      </Badge>
                    )}
                  </div>
                ))}
                {/* Upload slot */}
                <div className="aspect-square rounded-lg border-2 border-dashed border-border/60 flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors">
                  <Camera className="h-5 w-5 text-muted-foreground/40" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Drag to reorder · Click to select · Enhance selected with AI
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-0">
          <div className="space-y-4">
            {/* Add note */}
            <Card className="border-border/60 shadow-sm">
              <CardContent className="pt-4">
                <textarea
                  placeholder="Add a note for the team…"
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-20"
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm" className="h-8">
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    Add note
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes list */}
            {listing.notes.map((note) => (
              <Card key={note.id} className="border-border/60 shadow-sm">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-7 w-7 mt-0.5">
                      <AvatarFallback className="text-xs bg-primary/15 text-primary font-medium">
                        {note.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{note.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-0">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-4">
              <div className="space-y-4">
                {listing.activity.map((item, idx) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      {idx < listing.activity.length - 1 && (
                        <div className="absolute top-7 bottom-0 left-1/2 -translate-x-1/2 w-px bg-border/60" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm text-foreground/80">{item.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(item.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tools Tab */}
        <TabsContent value="ai" className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Description Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Generate a structured marketing description from listing facts. Output is
                  reviewable before publishing.
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Tone</label>
                  <select className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs">
                    <option>Luxury</option>
                    <option>Family-friendly</option>
                    <option>Investor</option>
                    <option>Modern</option>
                    <option>Neutral</option>
                  </select>
                </div>
                <Button size="sm" className="w-full h-8 gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate description
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  Photo Enhancement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Enhance selected listing photos using Gemini Imagen. Originals are always
                  preserved.
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Enhancement</label>
                  <select className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs">
                    <option>Color balance</option>
                    <option>Window recovery</option>
                    <option>Daylight boost</option>
                    <option>Straighten & crop</option>
                    <option>Twilight variant</option>
                  </select>
                </div>
                <Button size="sm" className="w-full h-8 gap-1.5" variant="outline">
                  <Camera className="h-3.5 w-3.5" />
                  Select photos to enhance
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Public Page Tab */}
        <TabsContent value="public" className="mt-0">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Public Property Page</CardTitle>
                <Badge
                  variant="secondary"
                  className={
                    listing.isPublished
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0'
                      : 'bg-muted text-muted-foreground border-0'
                  }
                >
                  {listing.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-center space-y-2">
                <Globe className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">Public page preview</p>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open public page
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  {listing.isPublished ? 'Update page' : 'Publish page'}
                </Button>
                {listing.isPublished && (
                  <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
                    Unpublish
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
