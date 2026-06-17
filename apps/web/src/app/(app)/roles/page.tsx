'use client'

import { useEffect, useState } from 'react'
import { Plus, Shield, Lock, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { api } from '@/lib/api'
import type { RoleResponse, PermissionResponse } from '@/lib/types'

const roleColors: Record<string, string> = {
  owner: 'bg-primary/15 text-primary',
  admin: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  agent: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  viewer: 'bg-muted text-muted-foreground',
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleResponse[]>([])
  const [permissions, setPermissions] = useState<PermissionResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDesc, setNewRoleDesc] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<RoleResponse[]>('/roles'),
      api.get<PermissionResponse[]>('/roles/permissions'),
    ])
      .then(([rolesData, permsData]) => {
        setRoles(rolesData)
        setPermissions(permsData)
      })
      .catch(() => toast.error('Could not load roles'))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newRoleName.trim()) {
      toast.error('Role name is required')
      return
    }
    setIsCreating(true)
    try {
      const role = await api.post<RoleResponse>('/roles', {
        name: newRoleName.trim(),
        description: newRoleDesc.trim() || undefined,
      })
      setRoles((prev) => [...prev, role])
      toast.success(`Role "${role.name}" created`)
      setShowCreate(false)
      setNewRoleName('')
      setNewRoleDesc('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not create role')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDelete(role: RoleResponse) {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return
    setDeletingId(role.id)
    try {
      await api.delete(`/roles/${role.id}`)
      setRoles((prev) => prev.filter((r) => r.id !== role.id))
      toast.success(`Role "${role.name}" deleted`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not delete role')
    } finally {
      setDeletingId(null)
    }
  }

  async function togglePermission(roleId: string, codename: string, hasIt: boolean) {
    try {
      if (hasIt) {
        await api.delete(`/roles/${roleId}/permissions/${codename}`)
      } else {
        await api.post(`/roles/${roleId}/permissions/${codename}`)
      }
      setRoles((prev) =>
        prev.map((r) =>
          r.id === roleId
            ? {
                ...r,
                permissions: hasIt
                  ? r.permissions.filter((p) => p !== codename)
                  : [...r.permissions, codename],
              }
            : r,
        ),
      )
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not update permission')
    }
  }

  const customRoles = roles.filter((r) => !r.is_system)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? '…' : `${roles.length} roles · Permissions enforced at API level`}
        </p>
        <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Create role
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/60 shadow-sm">
              <CardContent className="p-4 space-y-3 animate-pulse">
                <div className="h-7 w-32 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-3/4 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const color = roleColors[role.name.toLowerCase()] ?? 'bg-muted text-muted-foreground'
            return (
              <Card
                key={role.id}
                className="border-border/60 shadow-sm hover:border-primary/30 transition-colors group"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-md ${color}`}>
                        <Shield className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-semibold">{role.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {role.is_system && (
                        <Badge
                          variant="secondary"
                          className="text-xs border-0 bg-muted text-muted-foreground flex items-center gap-1"
                        >
                          <Lock className="h-2.5 w-2.5" />
                          System
                        </Badge>
                      )}
                      {!role.is_system && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          disabled={deletingId === role.id}
                          onClick={() => handleDelete(role)}
                        >
                          {deletingId === role.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {role.description ?? 'No description'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Permission matrix */}
      {!isLoading && permissions.length > 0 && customRoles.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Custom Role Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground w-56">
                    Permission
                  </th>
                  {customRoles.map((role) => (
                    <th
                      key={role.id}
                      className="text-center px-3 py-3 font-medium text-muted-foreground min-w-28"
                    >
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm, idx) => (
                  <tr
                    key={perm.id}
                    className={`border-b border-border/30 hover:bg-muted/20 ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
                  >
                    <td className="px-6 py-2.5 text-muted-foreground">
                      <span title={perm.description ?? undefined}>{perm.codename}</span>
                    </td>
                    {customRoles.map((role) => {
                      const hasIt = role.permissions.includes(perm.codename)
                      return (
                        <td key={role.id} className="text-center px-3 py-2">
                          <input
                            type="checkbox"
                            checked={hasIt}
                            onChange={() => togglePermission(role.id, perm.codename, hasIt)}
                            className="h-3.5 w-3.5 accent-primary cursor-pointer"
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* System roles matrix hint */}
      {!isLoading && customRoles.length === 0 && permissions.length > 0 && (
        <Card className="border-border/60 shadow-sm border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Create a custom role to configure its permissions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create role dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a custom role</DialogTitle>
            <DialogDescription>
              Custom roles let you define exactly what team members can do.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role name</Label>
              <Input
                id="role-name"
                placeholder="e.g. Senior Agent"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-desc">Description (optional)</Label>
              <Input
                id="role-desc"
                placeholder="What can this role do?"
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  'Create role'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
