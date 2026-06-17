'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, notFound } from 'next/navigation'
import {
  MapPin,
  Sparkles,
  Camera,
  ExternalLink,
  ChevronRight,
  Pencil,
  Globe,
  MoreHorizontal,
  FileText,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { generateDescription } from '@/app/actions/generate-description'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'
import { api } from '@/lib/api'
import type { ListingDetail, ListingNote, ListingStageHistory } from '@/lib/types'

const STAGE_ORDER = ['Lead', 'Prep', 'Photography', 'Active', 'Under Contract', 'Closed']

function stageColor(stage: string): string {
  const map: Record<string, string> = {
    Lead: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
    Prep: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    Photography: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
    Active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    'Under Contract': 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    Closed: 'bg-muted text-muted-foreground',
  }
  return map[stage] ?? 'bg-muted text-muted-foreground'
}

function fullAddress(listing: ListingDetail): string {
  if (!listing.address) return listing.title
  return [
    listing.address.street_1,
    listing.address.street_2,
    `${listing.address.city}, ${listing.address.state} ${listing.address.postal_code}`,
  ]
    .filter(Boolean)
    .join(', ')
}

function shortAddress(listing: ListingDetail): string {
  if (!listing.address) return listing.title
  return [listing.address.street_1, listing.address.street_2].filter(Boolean).join(', ')
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [noteBody, setNoteBody] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [isUpdatingStage, setIsUpdatingStage] = useState(false)
  const [notFound404, setNotFound404] = useState(false)
  const [aiTone, setAiTone] = useState('Luxury')
  const [generatedDesc, setGeneratedDesc] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const fetchListing = useCallback(async () => {
    try {
      const data = await api.get<ListingDetail>(`/listings/${id}`)
      setListing(data)
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('404')) {
        setNotFound404(true)
      }
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchListing()
  }, [fetchListing])

  async function updateStage(stage: string) {
    if (!listing || isUpdatingStage) return
    setIsUpdatingStage(true)
    try {
      const updated = await api.patch<ListingDetail>(`/listings/${listing.id}/stage`, { stage })
      setListing((prev) => (prev ? { ...prev, stage: updated.stage } : prev))
      toast.success(`Stage updated to ${stage}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not update stage')
    } finally {
      setIsUpdatingStage(false)
    }
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    if (!listing || !noteBody.trim()) return
    setIsAddingNote(true)
    try {
      const note = await api.post<ListingNote>(`/listings/${listing.id}/notes`, {
        body: noteBody.trim(),
      })
      setListing((prev) =>
        prev ? { ...prev, notes: [note, ...prev.notes] } : prev,
      )
      setNoteBody('')
      toast.success('Note added')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not add note')
    } finally {
      setIsAddingNote(false)
    }
  }

  if (notFound404) notFound()

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-4 w-48 rounded bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-8 w-96 rounded bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex gap-1">
          {STAGE_ORDER.map((s) => (
            <div key={s} className="h-9 flex-1 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground">Could not load listing</p>
        <button
          onClick={fetchListing}
          className="mt-3 text-sm text-primary hover:underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    )
  }

  const currentStageIdx = STAGE_ORDER.indexOf(listing.stage)
  const addr = shortAddress(listing)
  const full = fullAddress(listing)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Listings</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{addr}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-semibold tracking-tight">{addr}</h2>
            <Badge
              variant="secondary"
              className={`border-0 ${stageColor(listing.stage)}`}
            >
              {listing.stage}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{full}</span>
          </div>
          {listing.asking_price && (
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(parseFloat(listing.asking_price))}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
                disabled={isUpdatingStage}
                onClick={() => !isCurrent && updateStage(stage)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all w-full ${
                  isCurrent
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : isDone
                    ? 'text-muted-foreground/60 hover:bg-muted/40 cursor-pointer'
                    : 'text-muted-foreground/50 hover:bg-muted/40 cursor-pointer'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                ) : (
                  <div
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      isCurrent ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                )}
                <span className="truncate">{stage}</span>
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
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs h-7 px-4">
            Notes
            {listing.notes.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-4 min-w-4 text-[10px] px-1">
                {listing.notes.length}
              </Badge>
            )}
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
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Type', value: listing.property_type },
                      { label: 'Listing', value: listing.listing_type.replace('_', ' ') },
                      { label: 'Stage', value: listing.stage },
                      listing.bedrooms !== null && { label: 'Bedrooms', value: listing.bedrooms },
                      listing.bathrooms && { label: 'Bathrooms', value: listing.bathrooms },
                      listing.square_feet !== null && {
                        label: 'Square feet',
                        value: listing.square_feet?.toLocaleString(),
                      },
                      listing.year_built && { label: 'Year built', value: listing.year_built },
                      listing.mls_number && { label: 'MLS #', value: listing.mls_number },
                    ]
                      .filter(Boolean)
                      .map((fact) => {
                        if (!fact) return null
                        const f = fact as { label: string; value: string | number | null }
                        return (
                          <div key={f.label} className="space-y-0.5">
                            <dt className="text-xs text-muted-foreground">{f.label}</dt>
                            <dd className="text-sm font-medium">{f.value ?? '—'}</dd>
                          </div>
                        )
                      })}
                  </dl>
                </CardContent>
              </Card>

              {listing.description && (
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
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {listing.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {listing.address && (
                <Card className="border-border/60 shadow-sm overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Location</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-48 bg-muted/40 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">{full}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(listing.created_at)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Last updated</span>
                    <span>{formatDate(listing.updated_at)}</span>
                  </div>
                  {listing.listed_at && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Listed</span>
                      <span>{formatDate(listing.listed_at)}</span>
                    </div>
                  )}
                  {listing.closed_at && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Closed</span>
                      <span>{formatDate(listing.closed_at)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Publish Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: 'Address added', done: !!listing.address },
                    { label: 'Price set', done: !!listing.asking_price },
                    { label: 'Description added', done: !!listing.description },
                    { label: 'Stage set', done: listing.stage !== 'Lead' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          item.done ? 'text-primary' : 'text-muted-foreground/30'
                        }`}
                      />
                      <span
                        className={item.done ? 'text-foreground/80' : 'text-muted-foreground'}
                      >
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
                <CardTitle className="text-sm font-semibold">Media Gallery</CardTitle>
                <Button size="sm" className="h-8 gap-1.5">
                  <Camera className="h-3.5 w-3.5" />
                  Upload photos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/60 rounded-lg">
                <Camera className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No photos yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload photos to showcase this property
                </p>
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
            <Card className="border-border/60 shadow-sm">
              <CardContent className="pt-4">
                <form onSubmit={addNote}>
                  <textarea
                    placeholder="Add a note for the team…"
                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-20"
                    value={noteBody}
                    onChange={(e) => setNoteBody(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm" className="h-8" disabled={isAddingNote || !noteBody.trim()}>
                      {isAddingNote ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Add note
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {listing.notes.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No notes yet</p>
            ) : (
              listing.notes.map((note: ListingNote) => (
                <Card key={note.id} className="border-border/60 shadow-sm">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-7 w-7 mt-0.5">
                        <AvatarFallback className="text-xs bg-primary/15 text-primary font-medium">
                          ?
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">Team member</span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(note.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
                          {note.body}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-0">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-4">
              {listing.stage_history.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No activity yet</p>
              ) : (
                <div className="space-y-4">
                  {listing.stage_history.map(
                    (item: ListingStageHistory, idx: number) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          {idx < listing.stage_history.length - 1 && (
                            <div className="absolute top-7 bottom-0 left-1/2 -translate-x-1/2 w-px bg-border/60" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm text-foreground/80">
                            {item.from_stage
                              ? `Moved from ${item.from_stage} → ${item.to_stage}`
                              : `Stage set to ${item.to_stage}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(item.changed_at)}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tools Tab */}
        <TabsContent value="ai" className="mt-0">
          <div className="space-y-4">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Description Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Generate a marketing description from this listing&apos;s facts using Claude AI.
                  Review the output before publishing.
                </p>
                <div className="flex items-center gap-3">
                  <div className="space-y-1.5 flex-1">
                    <label className="text-xs font-medium">Tone</label>
                    <select
                      className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                    >
                      <option>Luxury</option>
                      <option>Family-friendly</option>
                      <option>Investor</option>
                      <option>Modern</option>
                      <option>Neutral</option>
                    </select>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 mt-5 shrink-0"
                    disabled={isGenerating}
                    onClick={async () => {
                      setIsGenerating(true)
                      setGeneratedDesc('')
                      try {
                        const desc = await generateDescription({
                          address: listing.address?.street_1 ?? listing.title,
                          city: listing.address?.city,
                          state: listing.address?.state,
                          price: listing.asking_price ?? undefined,
                          bedrooms: listing.bedrooms,
                          bathrooms: listing.bathrooms ?? undefined,
                          squareFeet: listing.square_feet,
                          yearBuilt: listing.year_built ?? undefined,
                          propertyType: listing.property_type,
                          tone: aiTone,
                        })
                        setGeneratedDesc(desc)
                        toast.success('Description generated')
                      } catch {
                        toast.error('Could not generate description')
                      } finally {
                        setIsGenerating(false)
                      }
                    }}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    {isGenerating ? 'Generating…' : 'Generate'}
                  </Button>
                </div>

                {generatedDesc && (
                  <div className="space-y-3">
                    <div className="rounded-md border border-border/60 bg-muted/30 p-3">
                      <p className="text-sm leading-relaxed text-foreground/80">{generatedDesc}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedDesc)
                          toast.success('Copied to clipboard')
                        }}
                      >
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs gap-1"
                        onClick={async () => {
                          try {
                            await api.patch(`/listings/${listing.id}`, {
                              description: generatedDesc,
                            })
                            setListing((prev) =>
                              prev ? { ...prev, description: generatedDesc } : prev,
                            )
                            toast.success('Description saved to listing')
                          } catch {
                            toast.error('Could not save description')
                          }
                        }}
                      >
                        <FileText className="h-3 w-3" />
                        Save to listing
                      </Button>
                    </div>
                  </div>
                )}
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
                  Upload photos first, then select them for AI enhancement. Originals are always
                  preserved.
                </p>
                <Button size="sm" className="w-full h-8 gap-1.5" variant="outline" disabled>
                  <Camera className="h-3.5 w-3.5" />
                  Upload photos to enable enhancement
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
                  className="bg-muted text-muted-foreground border-0"
                >
                  Preview
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3 flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <code className="flex-1 text-xs text-muted-foreground truncate">
                  /properties/{listing.id}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/properties/${listing.id}`,
                    )
                    toast.success('Link copied')
                  }}
                >
                  Copy
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={() => window.open(`/properties/${listing.id}`, '_blank')}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open preview
                </Button>
                <Button size="sm" className="flex-1 gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Publish page
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                The preview page uses your current session. Public access requires publishing.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
