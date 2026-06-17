'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { api } from '@/lib/api'
import type { PaginatedListings, Listing } from '@/lib/types'

const STAGES = ['All', 'Lead', 'Prep', 'Photography', 'Active', 'Under Contract', 'Closed']

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

function listingAddress(l: Listing): string {
  if (l.address) {
    return [l.address.street_1, l.address.street_2].filter(Boolean).join(', ')
  }
  return l.title
}

function listingCity(l: Listing): string {
  if (l.address) {
    return `${l.address.city}, ${l.address.state} ${l.address.postal_code}`
  }
  return ''
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeStage, setActiveStage] = useState('All')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(timer)
  }, [search])

  const fetchListings = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page_size: '50' })
      if (activeStage !== 'All') params.set('stage', activeStage)
      if (debouncedSearch) params.set('search', debouncedSearch)
      const data = await api.get<PaginatedListings>(`/listings?${params}`)
      setListings(data.items)
      setTotal(data.total)
    } catch {
      setListings([])
    } finally {
      setIsLoading(false)
    }
  }, [activeStage, debouncedSearch])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by address, city, or MLS…"
            className="h-9 text-sm pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ml-auto">
          <Link
            href="/listings/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New listing
          </Link>
        </div>
      </div>

      {/* Stage pills */}
      <div className="flex gap-1.5 flex-wrap">
        {STAGES.map((stage) => (
          <button
            key={stage}
            onClick={() => setActiveStage(stage)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              stage === activeStage
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Listings */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="divide-y divide-border/50">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-muted/30">
            <span>Property</span>
            <span className="text-right">Price</span>
            <span>Stage</span>
            <span>Updated</span>
          </div>

          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="h-14 w-20 rounded-lg bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-56 rounded bg-muted" />
                  <div className="h-3 w-36 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
              </div>
            ))
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                {activeStage !== 'All' || debouncedSearch
                  ? 'No listings match your filters'
                  : 'No listings yet'}
              </p>
              {!debouncedSearch && activeStage === 'All' && (
                <Link
                  href="/listings/new"
                  className="mt-3 text-xs text-primary hover:underline underline-offset-4"
                >
                  Create your first listing
                </Link>
              )}
            </div>
          ) : (
            listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="flex flex-col md:grid md:grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group items-center"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-14 w-20 rounded-lg bg-muted/60 flex-shrink-0 overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-br from-muted to-muted/30" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                      {listingAddress(listing)}
                    </p>
                    <p className="text-xs text-muted-foreground">{listingCity(listing)}</p>
                    {(listing.bedrooms || listing.square_feet) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {[
                          listing.bedrooms && `${listing.bedrooms}bd`,
                          listing.bathrooms && `${listing.bathrooms}ba`,
                          listing.square_feet && `${listing.square_feet.toLocaleString()} sqft`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-sm font-semibold text-right">
                  {listing.asking_price
                    ? formatCurrency(parseFloat(listing.asking_price))
                    : '—'}
                </div>

                <div>
                  <Badge
                    variant="secondary"
                    className={`text-xs px-2 py-0.5 border-0 ${stageColor(listing.stage)}`}
                  >
                    {listing.stage}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground">
                  {formatRelativeTime(listing.updated_at)}
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>

      {!isLoading && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {listings.length} of {total} listing{total !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
