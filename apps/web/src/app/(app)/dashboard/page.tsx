import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Home,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  Camera,
  FileText,
  MapPin,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard' }

const stats = [
  {
    label: 'Active Listings',
    value: '24',
    change: '+3 this month',
    trend: 'up',
    icon: Home,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    label: 'Total Portfolio Value',
    value: '$18.4M',
    change: '+12% YoY',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'Team Members',
    value: '8',
    change: '2 invites pending',
    trend: 'neutral',
    icon: Users,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    label: 'Avg. Days on Market',
    value: '23',
    change: '-4 from last month',
    trend: 'down',
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
  },
]

const recentListings = [
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
    updatedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    agent: 'Sarah Chen',
    agentInitials: 'SC',
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
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    agent: 'Marcus Lee',
    agentInitials: 'ML',
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
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    agent: 'Diana Walsh',
    agentInitials: 'DW',
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
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    agent: 'Sarah Chen',
    agentInitials: 'SC',
  },
]

const activity = [
  {
    id: '1',
    type: 'note',
    icon: FileText,
    text: 'Sarah added a note on 142 Riverside Drive',
    time: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: '2',
    type: 'media',
    icon: Camera,
    text: 'Marcus uploaded 24 photos for 890 Park Avenue',
    time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: '3',
    type: 'listing',
    icon: MapPin,
    text: '22 Hudson Yards moved to Under Contract',
    time: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: '4',
    type: 'listing',
    icon: Home,
    text: 'New listing created: 55 Water Street, Unit 12C',
    time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Good morning, Alish</h2>
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
              <div className="divide-y divide-border/50">
                {recentListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors group"
                  >
                    {/* Thumbnail placeholder */}
                    <div className="h-14 w-20 rounded-md bg-muted/60 flex-shrink-0 overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-br from-muted to-muted/40" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {listing.address}
                          </p>
                          <p className="text-xs text-muted-foreground">{listing.city}</p>
                        </div>
                        <p className="text-sm font-semibold shrink-0">
                          {formatCurrency(listing.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge
                          variant="secondary"
                          className={`text-xs px-2 py-0.5 ${listing.stageColor} border-0`}
                        >
                          {listing.stage}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {listing.beds}bd · {listing.baths}ba · {listing.sqft.toLocaleString()} sqft
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatRelativeTime(listing.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/15 text-primary font-medium">
                        {listing.agentInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div>
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activity.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed text-foreground/80">{item.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeTime(item.time)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
