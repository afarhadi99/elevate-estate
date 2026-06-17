'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Home,
  TrendingUp,
  Users,
  ArrowRight,
  FileText,
  MapPin,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, formatRelativeTime, initials } from '@/lib/utils'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import type { PaginatedListings, Listing } from '@/lib/types'

function StatsSkeletons() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <div className="space-y-2 animate-pulse">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-7 w-16 rounded bg-muted" />
              <div className="h-3 w-32 rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function stageColor(stage: string): string {
  const map: Record<string, string> = {
    Lead: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
    Prep: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    Photography: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
    Active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    'Under Contract': 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    Closed: 'bg-muted text-muted-foreground',
    Archived: 'bg-muted text-muted-foreground',
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

export default function DashboardPage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [memberCount, setMemberCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<PaginatedListings>('/listings?page_size=5').catch(() => null),
      api.get<{ user_id: string }[]>('/organizations/current/members').catch(() => null),
    ]).then(([listingsData, membersData]) => {
      if (listingsData) {
        setListings(listingsData.items)
        setTotal(listingsData.total)
      }
      if (membersData) {
        setMemberCount(membersData.length)
      }
      setIsLoading(false)
    })
  }, [])

  const firstName = user?.full_name?.split(' ')[0] ?? 'there'
  const activeCount = listings.filter(
    (l) => !['Closed', 'Archived', 'off_market'].includes(l.stage),
  ).length
  const totalValue = listings.reduce(
    (sum, l) => sum + (l.asking_price ? parseFloat(l.asking_price) : 0),
    0,
  )

  const stats = [
    {
      label: 'Active Listings',
      value: isLoading ? '—' : String(total),
      change: isLoading ? '' : `${activeCount} not yet closed`,
      icon: Home,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Portfolio Value',
      value: isLoading ? '—' : formatCurrency(totalValue),
      change: 'combined asking price',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Team Members',
      value: isLoading ? '—' : String(memberCount),
      change: 'in your organization',
      icon: Users,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Recent Activity',
      value: isLoading ? '—' : String(listings.length),
      change: 'listings loaded',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Good morning, {firstName}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s what&apos;s happening with your portfolio today.
          </p>
        </div>
        <Link
          href="/listings/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          <Home className="h-4 w-4" />
          New listing
        </Link>
      </div>

      {/* Stats */}
      {isLoading ? (
        <StatsSkeletons />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="border-border/60 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Listings */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Listings</CardTitle>
                <Link
                  href="/listings"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="divide-y divide-border/50">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                      <div className="h-14 w-20 rounded-md bg-muted flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-48 rounded bg-muted" />
                        <div className="h-3 w-32 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No listings yet</p>
                  <Link
                    href="/listings/new"
                    className="mt-3 text-xs text-primary hover:underline underline-offset-4"
                  >
                    Create your first listing
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {listings.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listings/${listing.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors group"
                    >
                      <div className="h-14 w-20 rounded-md bg-muted/60 flex-shrink-0 overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-br from-muted to-muted/40" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {listingAddress(listing)}
                            </p>
                            <p className="text-xs text-muted-foreground">{listingCity(listing)}</p>
                          </div>
                          {listing.asking_price && (
                            <p className="text-sm font-semibold shrink-0">
                              {formatCurrency(parseFloat(listing.asking_price))}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Badge
                            variant="secondary"
                            className={`text-xs px-2 py-0.5 border-0 ${stageColor(listing.stage)}`}
                          >
                            {listing.stage}
                          </Badge>
                          {listing.bedrooms && (
                            <span className="text-xs text-muted-foreground">
                              {listing.bedrooms}bd
                              {listing.bathrooms && ` · ${listing.bathrooms}ba`}
                              {listing.square_feet &&
                                ` · ${listing.square_feet.toLocaleString()} sqft`}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatRelativeTime(listing.updated_at)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity / Quick links */}
        <div>
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { href: '/listings/new', icon: Home, label: 'New listing' },
                { href: '/listings', icon: MapPin, label: 'All listings' },
                { href: '/team', icon: Users, label: 'Team' },
                { href: '/integrations', icon: FileText, label: 'Integrations' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
