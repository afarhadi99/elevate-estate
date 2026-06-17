import type { Metadata } from 'next'
import { Plus, Shield, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

export const metadata: Metadata = { title: 'Roles & Permissions' }

const ROLES = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to all features and settings. Cannot be deleted.',
    members: 1,
    isSystem: true,
    color: 'bg-primary/15 text-primary',
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Manage team, roles, integrations, and all listings.',
    members: 0,
    isSystem: true,
    color: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  },
  {
    id: 'senior-agent',
    name: 'Senior Agent',
    description: 'Create and manage listings, invite photographers.',
    members: 1,
    isSystem: false,
    color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  },
  {
    id: 'agent',
    name: 'Agent',
    description: 'Create and edit own listings, view all listings.',
    members: 2,
    isSystem: false,
    color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'photographer',
    name: 'Photographer',
    description: 'Upload and manage media for assigned listings only.',
    members: 1,
    isSystem: false,
    color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to listings and team directory.',
    members: 1,
    isSystem: false,
    color: 'bg-muted text-muted-foreground',
  },
]

const PERMISSIONS = [
  { resource: 'Listings', actions: ['View', 'Create', 'Edit', 'Archive', 'Publish', 'Delete'] },
  { resource: 'Media', actions: ['Upload', 'Reorder', 'Enhance with AI', 'Delete', 'Download original'] },
  { resource: 'Team', actions: ['View directory', 'Invite members', 'Remove members', 'Change roles'] },
  { resource: 'Roles', actions: ['View', 'Create', 'Edit', 'Delete', 'Assign'] },
  { resource: 'AI', actions: ['Generate description', 'Enhance photos', 'Approve output'] },
  { resource: 'Integrations', actions: ['View', 'Connect', 'Disconnect', 'Sync', 'View logs'] },
  { resource: 'Settings', actions: ['View', 'Update org settings', 'Manage theme', 'Manage signups'] },
]

export default function RolesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {ROLES.length} roles · Permissions are enforced at API and UI level
        </p>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create role
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((role) => (
          <Card
            key={role.id}
            className="border-border/60 shadow-sm cursor-pointer hover:border-primary/30 transition-colors group"
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-md ${role.color}`}>
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-semibold">{role.name}</span>
                </div>
                {role.isSystem && (
                  <Badge variant="secondary" className="text-xs border-0 bg-muted text-muted-foreground flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" />
                    System
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{role.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {role.members} member{role.members !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Edit permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission matrix */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground w-48">
                  Permission
                </th>
                {ROLES.filter((r) => ['owner', 'agent', 'photographer', 'viewer'].includes(r.id)).map(
                  (role) => (
                    <th
                      key={role.id}
                      className="text-center px-3 py-3 font-medium text-muted-foreground min-w-24"
                    >
                      {role.name}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((group, gi) => (
                <>
                  <tr key={`group-${gi}`} className="bg-muted/20">
                    <td colSpan={5} className="px-6 py-2 font-semibold text-foreground/70">
                      {group.resource}
                    </td>
                  </tr>
                  {group.actions.map((action, ai) => (
                    <tr key={`${gi}-${ai}`} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="px-6 py-2.5 text-muted-foreground pl-8">{action}</td>
                      {/* Owner always ✓ */}
                      <td className="text-center px-3 py-2.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mx-auto" />
                      </td>
                      {/* Agent */}
                      <td className="text-center px-3 py-2.5">
                        {['View', 'Create', 'Edit', 'Upload', 'Reorder', 'Generate description'].includes(action) ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary/60 mx-auto" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-border/60 mx-auto" />
                        )}
                      </td>
                      {/* Photographer */}
                      <td className="text-center px-3 py-2.5">
                        {['Upload', 'Reorder', 'View'].includes(action) ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary/60 mx-auto" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-border/60 mx-auto" />
                        )}
                      </td>
                      {/* Viewer */}
                      <td className="text-center px-3 py-2.5">
                        {['View', 'View directory'].includes(action) ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary/60 mx-auto" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-border/60 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
