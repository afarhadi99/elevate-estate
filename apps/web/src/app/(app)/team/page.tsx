import type { Metadata } from 'next'
import { UserPlus, Mail, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const metadata: Metadata = { title: 'Team' }

const members = [
  { id: '1', name: 'Alish Farhadi', email: 'afarhadi@mytsi.org', role: 'Owner', initials: 'AF', status: 'active', joinedAt: '2024-01-15' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@brokerage.com', role: 'Senior Agent', initials: 'SC', status: 'active', joinedAt: '2024-02-01' },
  { id: '3', name: 'Marcus Lee', email: 'marcus@brokerage.com', role: 'Agent', initials: 'ML', status: 'active', joinedAt: '2024-03-10' },
  { id: '4', name: 'Diana Walsh', email: 'diana@brokerage.com', role: 'Photographer', initials: 'DW', status: 'active', joinedAt: '2024-04-05' },
  { id: '5', name: 'James Park', email: 'james@brokerage.com', role: 'Agent', initials: 'JP', status: 'invited', joinedAt: null },
  { id: '6', name: 'Lisa Nguyen', email: 'lisa@brokerage.com', role: 'Viewer', initials: 'LN', status: 'invited', joinedAt: null },
]

const roleColors: Record<string, string> = {
  Owner: 'bg-primary/15 text-primary',
  Admin: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  'Senior Agent': 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  Agent: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  Photographer: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  Viewer: 'bg-muted text-muted-foreground',
}

export default function TeamPage() {
  const activeMembers = members.filter((m) => m.status === 'active')
  const pendingMembers = members.filter((m) => m.status === 'invited')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {activeMembers.length} active · {pendingMembers.length} pending invite
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="h-4 w-4" />
          Invite member
        </Button>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Active members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {activeMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs border-0 ${roleColors[member.role] ?? 'bg-muted text-muted-foreground'}`}
                >
                  {member.role}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Change role</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      Remove from team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {pendingMembers.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Pending invitations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {pendingMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{member.email}</p>
                    <p className="text-xs text-muted-foreground">Invitation sent · Pending acceptance</p>
                  </div>
                  <Badge variant="secondary" className="text-xs border-0 bg-muted text-muted-foreground">
                    {member.role}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                    Resend
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
