'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  Shield,
  Plug,
  Settings,
  ChevronDown,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Listings', href: '/listings', icon: Home },
  { label: 'Team', href: '/team', icon: Users },
  { label: 'Roles', href: '/roles', icon: Shield },
  { label: 'Integrations', href: '/integrations', icon: Plug },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-4 border-b border-sidebar-border/60">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
          <Building2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-semibold text-sm tracking-tight text-sidebar-foreground">
            Elevate Estate
          </span>
          <span className="text-xs text-sidebar-foreground/50">Premium CRM</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50'
                  )}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Quick add */}
        <div className="mt-6 px-1">
          <Link
            href="/listings/new"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <Plus className="h-4 w-4" />
            New listing
          </Link>
        </div>
      </ScrollArea>

      {/* Org footer */}
      <div className="border-t border-sidebar-border/60 p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-sidebar-accent/50 cursor-pointer transition-colors">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
            EE
          </div>
          <div className="flex flex-col leading-none min-w-0">
            <span className="text-sm font-medium text-sidebar-foreground truncate">
              Elevate Estate Co.
            </span>
            <span className="text-xs text-sidebar-foreground/50">Owner</span>
          </div>
          <ChevronDown className="ml-auto h-3.5 w-3.5 text-sidebar-foreground/40 shrink-0" />
        </div>
      </div>
    </aside>
  )
}
