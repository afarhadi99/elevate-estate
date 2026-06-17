import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Filter, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

export const metadata: Metadata = { title: 'Listings' }

const STAGES = ['All', 'Prep', 'Photography', 'Active', 'Under Contract', 'Closed', 'Archived']

const listings = [
  {
    id: '1',
    address: '142 Riverside Drive',
    city: 'New York, NY 10024',
    price: 2850000,
    stage: 'Photography',
    stageColor: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
    beds: 4,
    baths: 3,
    sqft: 2400,
    type: 'Condo',
    status: 'Active',
    updatedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    agent: 'Sarah Chen',
    agentInitials: 'SC',
    mediaCount: 12,
    hasPublicPage: true,
  },
  {
    id: '2',
    address: '890 Park Avenue',
    city: 'New York, NY 10075',
    price: 4200000,
    stage: 'Active',
    stageColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    beds: 5,
    baths: 4,
    sqft: 3200,
    type: 'Co-op',
    status: 'Active',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    agent: 'Marcus Lee',
    agentInitials: 'ML',
    mediaCount: 24,
    hasPublicPage: true,
  },
  {
    id: '3',
    address: '55 Water Street, Unit 12C',
    city: 'New York, NY 10041',
    price: 1150000,
    stage: 'Prep',
    stageColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    beds: 2,
    baths: 2,
    sqft: 1100,
    type: 'Condo',
    status: 'Active',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    agent: 'Diana Walsh',
    agentInitials: 'DW',
    mediaCount: 0,
    hasPublicPage: false,
  },
  {
    id: '4',
    address: '22 Hudson Yards',
    city: 'New York, NY 10001',
    price: 6800000,
    stage: 'Under Contract',
    stageColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    beds: 6,
    baths: 5,
    sqft: 4800,
    type: 'Penthouse',
    status: 'Active',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    agent: 'Sarah Chen',
    agentInitials: 'SC',
    mediaCount: 48,
    hasPublicPage: true,
  },
  {
    id: '5',
    address: '1010 Fifth Avenue',
    city: 'New York, NY 10028',
    price: 3500000,
    stage: 'Active',
    stageColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    beds: 3,
    baths: 3,
    sqft: 2200,
    type: 'Co-op',
    status: 'Active',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    agent: 'Marcus Lee',
    agentInitials: 'ML',
    mediaCount: 18,
    hasPublicPage: true,
  },
]

export default function ListingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by address, city, or MLS…"
          className="max-w-xs h-9 text-sm"
        />
        <Select defaultValue="All">
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </Button>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Sort
        </Button>
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
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              stage === 'All'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Listings table/cards */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="divide-y divide-border/50">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-muted/30">
            <span>Property</span>
            <span className="text-right">Price</span>
            <span>Stage</span>
            <span>Updated</span>
            <span>Agent</span>
          </div>

          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="flex flex-col md:grid md:grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group items-center"
            >
              {/* Property info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-14 w-20 rounded-lg bg-muted/60 flex-shrink-0 overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-br from-muted to-muted/30" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                    {listing.address}
                  </p>
                  <p className="text-xs text-muted-foreground">{listing.city}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {listing.beds}bd · {listing.baths}ba · {listing.sqft.toLocaleString()} sqft ·{' '}
                    {listing.type}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="text-sm font-semibold text-right">
                {formatCurrency(listing.price)}
              </div>

              {/* Stage */}
              <div>
                <Badge
                  variant="secondary"
                  className={`text-xs px-2 py-0.5 border-0 ${listing.stageColor}`}
                >
                  {listing.stage}
                </Badge>
              </div>

              {/* Updated */}
              <div className="text-xs text-muted-foreground">
                {formatRelativeTime(listing.updatedAt)}
              </div>

              {/* Agent */}
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center text-xs font-medium text-primary">
                  {listing.agentInitials}
                </div>
                <span className="text-xs text-muted-foreground hidden lg:block">
                  {listing.agent}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Showing {listings.length} listings
      </p>
    </div>
  )
}
