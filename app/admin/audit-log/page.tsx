'use client'

import * as React from 'react'
import { ShieldAlert } from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { PageHeader } from '@/components/admin/primitives'
import { AuditTable } from '@/components/admin/audit-table'
import { SystemLogTable } from '@/components/admin/system-log-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AuditLogPage() {
  const { user, isLoading } = useAuth()
  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'superadmin'

  if (isLoading) {
    return null
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Audit Log"
          description="A complete, filterable record of every privileged action taken by staff."
        />
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
            <ShieldAlert className="size-6" />
          </div>
          <h2 className="text-lg font-semibold">Access Restricted</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-md">
            Audit logs contain sensitive security records and are restricted to SuperAdmin personnel only.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit Log"
        description="Privileged staff actions and the full system-wide request trail."
      />
      <Tabs defaultValue="actions">
        <TabsList>
          <TabsTrigger value="actions">Privileged Actions</TabsTrigger>
          <TabsTrigger value="requests">All Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="actions">
          <AuditTable />
        </TabsContent>
        <TabsContent value="requests">
          <SystemLogTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
